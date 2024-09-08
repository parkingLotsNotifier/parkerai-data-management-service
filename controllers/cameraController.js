const Camera = require("../models/Camera");
const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Blueprint = require("../utils/data-orgenize/Blueprint");
const Document = require("../models/Document");
const { parseBlueprint } = require("../utils/data-orgenize/parseBlueprint");

// Add a new camera
exports.addCamera = async (req, res) => {
  const { cameraModel, area, cameraAddr, blueprint, parkingLotId, userId } = req.body;

  try {
    const newCamera = new Camera({
      cameraModel,
      area,
      cameraAddr,
      blueprint,
      parkingLotId,
      userId,
    });


    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User ID not provided"
      });
    }
    const savedCamera = await newCamera.save();
    res.status(201).json(savedCamera);
  } catch (error) {
    res.status(400).json({ message: "Error adding camera", error: error.message });
  }
};

// Remove a camera
exports.removeCamera = async (req, res) => {
  const { cameraId } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not found in cookies" });
  }

  try {
    const camera = await Camera.findByIdAndDelete(cameraId);

    if (camera) {
      const parkingLot = await ParkingLot.findById(camera.parkingLot);
      if (parkingLot) {
        parkingLot.cameraIds = parkingLot.cameraIds.filter(
          (id) => id.toString() !== cameraId
        );
        await parkingLot.save();
      }
      res.status(200).json({ message: "Camera removed successfully" });
    } else {
      res.status(404).json({ message: "Camera not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error removing camera", error });
  }
};

// Update a camera blueprint
exports.updateBlueprint = async (req, res) => {
  const { cameraId, blueprint } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not found in cookies" });
  }

  if (!cameraId) {
    return res
      .status(400)
      .json({ message: "Error updating blueprint: no cameraId provided" });
  }

  try {
    const camera = await Camera.findById(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    const parkingLot = await ParkingLot.findById(camera.parkingLot);
    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    // Create a new Document object based on the blueprint
    const categoryNameToBbox = new Blueprint(blueprint).categoryNameToBbox;
    const documentData = parseBlueprint(blueprint, categoryNameToBbox);

    // Update the camera's blueprint
    camera.blueprint = documentData;
    await camera.save();

    res.status(200).json({ message: "Blueprint updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error updating blueprint", error });
  }
};

exports.updateCamera = async (req, res) => {
  const { id } = req.params;
  const { cameraModel, area, cameraAddr, blueprint } = req.body;

  try {
    const updatedCamera = await Camera.findByIdAndUpdate(
      id,
      { cameraModel, area, cameraAddr, blueprint },
      { new: true, runValidators: true }
    );

    if (!updatedCamera) {
      return res.status(404).json({ message: "Camera not found" });
    }

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

exports.deleteCamera = async (req, res) => {
  const { id } = req.params;

  try {
    const camera = await Camera.findById(id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    // Remove the camera from the associated parking lot
    await ParkingLot.findByIdAndUpdate(camera.parkingLot, {
      $pull: { cameraIds: camera._id }
    });

    // Delete the camera
    await Camera.findByIdAndDelete(id);

    res.status(200).json({ message: "Camera deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting camera", error: error.message });
  }
};
