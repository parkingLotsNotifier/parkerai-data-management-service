const Document = require("../models/Document");
const Camera = require("../models/Camera");
const ParkingLot = require("../models/ParkingLot");
const mongoose = require('mongoose');

// Add a new document
exports.addDocument = async (req, res) => {
  const { file_name, slots, camera_id } = req.body;
  
  try {
    const camera = await Camera.findById(camera_id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    const parkingLot = await ParkingLot.findById(camera.parkingLotId);
    const storeDocument = new Document({
      file_name,
      slots,
      camera_id: camera._id,
      area: camera.area,
      parking_name: parkingLot.name,
    });

    await storeDocument.save();

    res.status(201).json({
      message: "Document added successfully",
      documentId: storeDocument._id,
    });
  } catch (error) {
    res.status(400).json({ message: "Error adding document", error });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  const { documentId, file_name, slots, camera_id } = req.body;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (file_name) document.file_name = file_name;
    if (slots) document.slots = slots;

    if (camera_id) {
      const camera = await Camera.findById(camera_id);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      document.camera = camera;
      document.area = camera.area;

      const parkingLot = await ParkingLot.findById(camera.parkingLot._id);
      document.parking_name = parkingLot.name;
    }

    await document.save();
    res.status(200).json({ message: "Document updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error updating document", error });
  }
};

// TODO: if not in use delete
// Delete a document 
exports.deleteDocument = async (req, res) => {
  const { documentId, cameraId } = req.body;

  try {
    const document = await Document.findByIdAndDelete(documentId);

    if (document) {
      const camera = await Camera.findById(cameraId);
      if (camera) {
        camera.documents = camera.documents.filter(
          (id) => id.toString() !== documentId
        );
        await camera.save();
      }
      res.status(200).json({ message: "Document deleted successfully" });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error deleting document", error });
  }
};

// Add this new function to the existing controller
exports.getCameraDocuments = async (req, res) => {
  const { cameraId } = req.params;
  const { page = 0, pageSize = 25, sort = "{}", search = "" } = req.query;

  try {
    const camera = await Camera.findById(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    const sortObj = JSON.parse(sort);
    let filter = { _id: { $in: camera.cameraDocs } };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { file_name: searchRegex },
        { "slots.lot_name": searchRegex }
      ];

      // If the search string is a valid ObjectId, include it in the search
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }
    }

    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .sort(sortObj)
      .skip(parseInt(page) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .exec();

    res.status(200).json({
      documents,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error("Error fetching camera documents:", error);
    res.status(500).json({ message: "Error fetching camera documents", error: error.message });
  }
};

// TODO: THIS IS NOT A CONTROLLER
exports.removeDocuments = async (docIds) =>{
  try {
    await Document.deleteMany({ _id: { $in: docIds } });
  } catch (error) {
    throw new Error("Error removing documents: " + error.message);
  }
}
