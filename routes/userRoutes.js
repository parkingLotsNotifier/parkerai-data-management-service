const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// Routes for user operations
router.post("/uploadPhoto", userController.uploadPhotoHandler);


router.use(express.json({ limit: "10mb" }));

router.post("/updateUser", userController.updateUser);
router.post("/deleteUser", userController.deleteUser);
router.post("/updateUserField", userController.updateUserFieldHandler);
router.get("/getUserInformation/:userId", userController.getUserInformation);
router.get("/getAllUsers", userController.getAllUsers);
router.post(
  "/createUserFolderStructure",
  userController.createUserFolderStructure
);
router.post("/retriveImage", userController.retrieveImage);


module.exports = router;
