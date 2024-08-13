const Document = require("../models/Document");
const Camera = require("../models/Camera");

// Add a new document
exports.addDocument = async (req, res) => {
  const { fileName, slots, cameraId } = req.body;

  try {
    const newDocument = new Document({ fileName, slots, parkingName });
    await newDocument.save();

    const camera = await Camera.findById(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    camera.documents.push(newDocument._id);
    await camera.save();

    res
      .status(201)
      .json({
        message: "Document added successfully",
        documentId: newDocument._id,
      });
  } catch (error) {
    res.status(400).json({ message: "Error adding document", error });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  const { documentId, fileName, slots, parkingName } = req.body;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (fileName) document.fileName = fileName;
    if (slots) document.slots = slots;
    if (parkingName) document.parkingName = parkingName;

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
