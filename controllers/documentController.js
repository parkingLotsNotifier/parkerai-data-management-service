const Document = require("../models/Document");
const Camera = require("../models/Camera");
const ParkingLot = require("../models/ParkingLot");

// Add a new document
exports.addDocument = async (req, res) => {
  const { file_name, slots, camera_id } = req.body;

  try {
    const camera = await Camera.findById(camera_id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    const parkingLot = await ParkingLot.findById(camera.parkingLot._id);
    const storeDocument = new Document({
      file_name,
      slots,
      camera,
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
