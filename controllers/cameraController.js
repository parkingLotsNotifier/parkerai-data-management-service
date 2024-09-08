const Camera = require("../models/Camera");
const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Blueprint = require("../utils/data-orgenize/Blueprint");
const Document = require("../models/Document");
const { parseBlueprint } = require("../utils/data-orgenize/parseBlueprint");
const ParkingLotController = require('./parkingLotController');

// Add a new camera
exports.addCamera = async (req, res) => {
  const { cameraModel, area, cameraAddr, blueprint, parkingLotId, userId } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User ID not provided"
      });
    }

    // Validate blueprint
    const blueprintValidation = validateBlueprint(blueprint);
    if (!blueprintValidation.isValid) {
      return res.status(400).json({ message: `Invalid blueprint: ${blueprintValidation.error}` });
    }

    // Add blueprint names to parking lot
    const blueprintNames = blueprint.categories.map(category => category.name);
    const result = await ParkingLotController.addParkingSlotNames(parkingLotId, blueprintNames);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const newCamera = new Camera({
      cameraModel,
      area,
      cameraAddr,
      blueprint,
      parkingLotId,
      userId,
    });

    const savedCamera = await newCamera.save();

    // Add camera to parking lot
    await ParkingLotController.addCameraToParkingLot(parkingLotId, savedCamera._id);

    res.status(201).json(savedCamera);
  } catch (error) {
    res.status(400).json({ message: "Error adding camera", error: error.message });
  }
};

exports.deleteCamera = async (req, res) => {
  const { id } = req.params;

  try {
    const camera = await Camera.findById(id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    // Remove the camera from the associated parking lot
    await ParkingLotController.removeCameraFromParkingLot(camera.parkingLotId, camera._id);

    // Remove blueprint names from parking lot
    const blueprintNames = camera.blueprint.categories.map(category => category.name);
    await ParkingLotController.removeParkingSlotNames(camera.parkingLotId, blueprintNames);

    // Delete the camera
    await Camera.findByIdAndDelete(id);

    res.status(200).json({ message: "Camera deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting camera", error: error.message });
  }
};

exports.updateCamera = async (req, res) => {
  const { id } = req.params;
  const { cameraModel, area, cameraAddr, blueprint } = req.body;

  try {
    const camera = await Camera.findById(id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    // Validate blueprint
    const blueprintValidation = validateBlueprint(blueprint);
    if (!blueprintValidation.isValid) {
      return res.status(400).json({ message: `Invalid blueprint: ${blueprintValidation.error}` });
    }

    // Remove old blueprint names from parking lot
    const oldBlueprintNames = camera.blueprint.categories.map(category => category.name);
    await ParkingLotController.removeParkingSlotNames(camera.parkingLotId, oldBlueprintNames);

    // Add new blueprint names to parking lot
    const newBlueprintNames = blueprint.categories.map(category => category.name);
    const result = await ParkingLotController.addParkingSlotNames(camera.parkingLotId, newBlueprintNames);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const updatedCamera = await Camera.findByIdAndUpdate(
      id,
      { cameraModel, area, cameraAddr, blueprint },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCamera);
  } catch (error) {
    res.status(400).json({ message: "Error updating camera", error: error.message });
  }
};

exports.getCameras = async (req, res) => {
  const { parkingLotId } = req.params;

  try {
    const cameras = await Camera.find({ parkingLot: parkingLotId });
    res.status(200).json(cameras);
  } catch (error) {
    res.status(400).json({ message: "Error fetching cameras", error: error.message });
  }
};

exports.removeCamera = async (req, res) => {
  // This function is now replaced by deleteCamera, so we can remove this route
  res.status(400).json({ message: "This route is deprecated. Please use DELETE /deleteCamera/:id instead." });
};

exports.updateBlueprint = async (req, res) => {
  const { id } = req.params;
  const { blueprint } = req.body;

  try {
    const camera = await Camera.findById(id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    // Remove old blueprint names from parking lot
    const oldBlueprintNames = camera.blueprint.categories.map(category => category.name);
    await ParkingLotController.removeParkingSlotNames(camera.parkingLotId, oldBlueprintNames);

    // Add new blueprint names to parking lot
    const newBlueprintNames = blueprint.categories.map(category => category.name);
    const result = await ParkingLotController.addParkingSlotNames(camera.parkingLotId, newBlueprintNames);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    camera.blueprint = blueprint;
    await camera.save();

    res.status(200).json(camera);
  } catch (error) {
    res.status(400).json({ message: "Error updating blueprint", error: error.message });
  }
};

// Helper function to validate blueprint
function validateBlueprint(blueprint) {
  if (!blueprint.categories || blueprint.categories.length === 0) {
    return { isValid: false, error: "Categories array is empty" };
  }

  for (let category of blueprint.categories) {
    if (!category.id || !category.name || !('supercategory' in category)) {
      return { isValid: false, error: "Invalid category object structure" };
    }
  }

  if (!blueprint.annotations || blueprint.annotations.length === 0) {
    return { isValid: false, error: "Annotations array is empty" };
  }

  for (let annotation of blueprint.annotations) {
    if (!annotation.id || !annotation.image_id || !annotation.category_id ||
      !Array.isArray(annotation.segmentation) || !('area' in annotation) ||
      !Array.isArray(annotation.bbox) || annotation.bbox.length !== 4 ||
      !('iscrowd' in annotation) || !annotation.attributes ||
      !('occluded' in annotation.attributes) || !('rotation' in annotation.attributes)) {
      return { isValid: false, error: "Invalid annotation object structure" };
    }
  }

  return { isValid: true };
}

