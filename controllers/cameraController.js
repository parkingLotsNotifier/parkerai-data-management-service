const Camera = require("../models/Camera");
const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Blueprint = require("../utils/data-orgenize/Blueprint");
const Document = require("../models/Document");
const { parseBlueprint } = require("../utils/data-orgenize/parseBlueprint");

// Add a new camera
exports.addCamera = async (req, res) => {
  const { blueprint, parkingLotId, model, area } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not found in cookies" });
  }

  try {
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    // Create a new Document object based on the blueprint
    const categoryNameToBbox = new Blueprint(blueprint).categoryNameToBbox;
    const documentData = parseBlueprint(blueprint, categoryNameToBbox);
    const newCamera = new Camera({
      blueprint: documentData,
      parkingLot: parkingLotId,
      model: model,
      area: area,
    });

    await newCamera.save();

    // Add camera to parking lot
    parkingLot.cameraIds.push(newCamera._id);
    await parkingLot.save();

    res
      .status(201)
      .json({ message: "Camera added successfully", cameraId: newCamera._id });
  } catch (error) {
    res.status(400).json({ message: "Error adding camera", error });
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
