const express = require('express');
const cameraController = require('../controllers/cameraController');
const router = express.Router();

// Routes for camera operations
router.post('/add', cameraController.addCamera);
router.post('/remove', cameraController.removeCamera);
router.post('/update-blueprint', cameraController.updateBlueprint);

module.exports = router;
