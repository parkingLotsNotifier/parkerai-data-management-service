const express = require("express");
const documentController = require("../controllers/documentController");
const router = express.Router();

// Routes for document operations
router.post("/store", documentController.addDocument);
router.post("/update", documentController.updateDocument);
router.post("/delete", documentController.deleteDocument);
router.get('/getCameraDocuments/:cameraId', documentController.getCameraDocuments);

module.exports = router;
