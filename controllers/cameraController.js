const Camera = require("../models/Camera");
const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Blueprint = require("../utils/data-orgenize/Blueprint");
const Document = require("../models/Document");
const { parseBlueprint } = require("../utils/data-orgenize/parseBlueprint");
const parkingLotController = require('./parkingLotController');
const documentController = require('../controllers/documentController');

// TODO: clean code

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
    const result = await parkingLotController.addParkingSlotNames(parkingLotId, blueprintNames);
   
    // this is what parse the cvat blueprint the user uploaded
    const categoryNameToBbox = new Blueprint(blueprint).categoryNameToBbox;
    const documentData = parseBlueprint(blueprint, categoryNameToBbox);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const newCamera = new Camera({
      cameraModel,
      area,
      cameraAddr,
      blueprint: documentData,
      parkingLotId,
      userId,
    });

    const savedCamera = await newCamera.save();

    // Add camera to parking lot
    await parkingLotController.addCameraToParkingLot(parkingLotId, savedCamera._id);

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
    await parkingLotController.removeCameraFromParkingLot(camera.parkingLotId, camera._id);

    // Remove blueprint names from parking lot
    const blueprintNames = camera.blueprint.categories.map(category => category.name);
    await parkingLotController.removeParkingSlotNames(camera.parkingLotId, blueprintNames);

    // Delete the camera
    await Camera.findByIdAndDelete(id);

    res.status(200).json({ message: "Camera deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting camera", error: error.message });
  }
};

// TODO: change route to POST as the others
exports.updateCamera = async (req, res) => {
  const { id } = req.params;
  // Extract possible fields from req.body
  const { cameraModel, area, cameraAddr, blueprint, cameraDocId } = req.body;
  try {
    const camera = await Camera.findById(id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    // If blueprint is provided, process it
    if (blueprint !== undefined) {
      // Validate blueprint
      const blueprintValidation = validateBlueprint(blueprint);
      if (!blueprintValidation.isValid) {
        return res
          .status(400)
          .json({ message: `Invalid blueprint: ${blueprintValidation.error}` });
      }

      // Parse the CVAT blueprint the user uploaded
      const categoryNameToBbox = new Blueprint(blueprint).categoryNameToBbox;
      const documentData = parseBlueprint(blueprint, categoryNameToBbox);

      // Remove old blueprint names from parking lot if the Blueprint exist
      if (camera.blueprint) {
        const oldBlueprintNames = camera.blueprint.slots.map(
          (slot) => slot.lot_name
        );
        await parkingLotController.removeParkingSlotNames(
          camera.parkingLotId,
          oldBlueprintNames
        );
      }

      // Add new blueprint names to parking lot 
      const newBlueprintNames = blueprint.categories.map(
        (category) => category.name
      );
      const result = await parkingLotController.addParkingSlotNames(
        camera.parkingLotId,
        newBlueprintNames
      );
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      // Update blueprint
      camera.blueprint = documentData;
    }

    // Update other fields if they are provided
    if (cameraModel !== undefined) {
      camera.cameraModel = cameraModel;
    }

    if (area !== undefined) {
      camera.area = area;
    }

    if (cameraAddr !== undefined) {
      camera.cameraAddr = cameraAddr;
    }

    // If cameraDocId is provided, push it to cameraDocs array
    if (cameraDocId !== undefined) {
        camera.cameraDocs.push(cameraDocId);
    }

    // Save the updated camera
    await camera.save();

    

    res.status(200).json(camera);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating camera", error: error.message });
  }
};


exports.getCameras = async (req, res) => {
  const { parkingLotId } = req.params;

  try {
    console.log("Fetching cameras for parking lot ID:", parkingLotId);
    const cameras = await Camera.find({ parkingLotId: parkingLotId });
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
    await parkingLotController.removeParkingSlotNames(camera.parkingLotId, oldBlueprintNames);

    // Add new blueprint names to parking lot
    const newBlueprintNames = blueprint.categories.map(category => category.name);
    const result = await parkingLotController.addParkingSlotNames(camera.parkingLotId, newBlueprintNames);
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

// Add this new function to the existing controller
exports.getCamera = async (req, res) => {
  const { cameraId } = req.params;

  try {
    const camera = await Camera.findById(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    res.status(200).json(camera);
  } catch (error) {
    console.error("Error fetching camera:", error);
    res.status(500).json({ message: "Error fetching camera", error: error.message });
  }
};

exports.removeCameraDocsHandler = async (req, res) => {
  const { cameraId } = req.params;
  const { date } = req.body; // Assuming the date is provided in the request body

  try {
    // Parse and validate the provided date
    const providedDate = new Date(date);
    if (isNaN(providedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date provided" });
    }
    // Find the camera by ID
    const camera = await Camera.findById(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    
    // Check if cameraDocs array is empty
    if (!camera.cameraDocs || camera.cameraDocs.length === 0) {
      return res.status(200).json({ message: "No camera documents to remove" });
    }
    
    // Find documents in cameraDocs prior to the provided date
    const docsToRemove = await Document.find({
      _id: { $in: camera.cameraDocs },
      createdAt: { $lt: providedDate },
    });
  
    console.log(docsToRemove)

    if (docsToRemove.length === 0) {
      return res.status(200).json({ message: "No camera documents to remove prior to the provided date" });
    }
    // Get the IDs of the documents to remove
    const docIdsToRemove = docsToRemove.map(doc => doc._id.toString());
    
    // Remove the document IDs from the cameraDocs array
    camera.cameraDocs = camera.cameraDocs.filter(docId => !docIdsToRemove.includes(docId.toString()));

    // Save the updated camera document
    await camera.save();

    // Remove the actual documents from the Document collection
    await documentController.removeDocuments(docIdsToRemove);

    res.status(200).json({ message: "Documents removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing camera documents", error: error.message });
  }
};




