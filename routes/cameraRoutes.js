const express = require('express');
const cameraController = require('../controllers/cameraController');
const router = express.Router();

// Routes for camera operations
router.post('/addCamera', cameraController.addCamera);
router.post('/removeCamera', cameraController.removeCamera);
router.post('/updateBlueprintCamera', cameraController.updateBlueprint);
router.post('/updateCameraField', cameraController.updateCameraFieldHandler);

module.exports = router;
