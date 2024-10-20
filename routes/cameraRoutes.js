const express = require("express");
const cameraController = require("../controllers/cameraController");
const router = express.Router();

// Routes for camera operations
router.post("/addCamera", cameraController.addCamera);
router.post("/updateBlueprintCamera/:id", cameraController.updateBlueprint);
router.put("/updateCamera/:id", cameraController.updateCamera);
router.get("/getCameras/:parkingLotId", cameraController.getCameras);
router.delete("/deleteCamera/:id", cameraController.deleteCamera);
router.get("/getCamera/:cameraId", cameraController.getCamera);
router.delete("/removeCameraDocs/:cameraId", cameraController.removeCameraDocsHandler)

module.exports = router;
