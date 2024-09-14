const User = require("../models/User");
const { getStorageInstance } = require("../configs/database");
const {
  ref,
  listAll,
  uploadString,
  getMetadata,
  uploadBytes,
  getStorage,
  getDownloadURL,
} = require("firebase/storage");
const sharp = require('sharp');
const multer = require("multer");

// Get user information (without password)
exports.getUserInformation = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error retrieving user information", error });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const {
    userId,
    email,
    role,
    username,
    firstName,
    lastName,
    companyName,
    phoneNumber,
    password,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) user.email = email;
    if (role) user.role = role;
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (companyName) user.companyName = companyName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error updating user", error });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error deleting user", error });
  }
};

exports.updateUserFieldHandler = async (req, res) => {
  const { userId, fieldName, fieldValue, operation } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid User ID");
    }

    let updateObject = {};

    switch (operation) {
      case "set":
        updateObject = { $set: { [fieldName]: fieldValue } };
        break;
      case "push":
        if (!Array.isArray(fieldValue)) {
          updateObject = { $push: { [fieldName]: fieldValue } };
        } else {
          updateObject = { $push: { [fieldName]: { $each: fieldValue } } };
        }
        break;
      case "pull":
        updateObject = { $pull: { [fieldName]: fieldValue } };
        break;
      case "unset":
        updateObject = { $unset: { [fieldName]: "" } };
        break;
      default:
        return res.status(400).send("Invalid operation");
    }

    const result = await User.updateOne({ _id: userId }, updateObject, {
      runValidators: true,
    });

    if (result.nModified === 0) {
      return res.status(404).send("User not found or field not modified");
    }

    res.status(200).send("User field updated successfully");
  } catch (err) {
    res.status(500).send("Error updating user field: " + err.message);
  }
};

exports.createUserFolderStructure = async (req, res) => {
  const { userId, context, parkingLotId } = req.body;

  const storage = getStorageInstance();

  let folderNames = [];

  if (context === "user") {
    // Define folder structure for "user" context
    folderNames = [
      `${userId}/myparkinglots/`,
      `${userId}/userinformation/`,
      `${userId}/mycameras/`,
    ];
  } else if (context === "parkinglot" && parkingLotId) {
    // Define folder structure for "parkinglot" context
    folderNames = [`${userId}/myparkinglots/${parkingLotId}/`];
  } else {
    // Handle invalid or missing context
    return res.status(400).send({
      message: "Invalid context or missing necessary parameters.",
    });
  }

  try {
    // Iterate over the list of folder names
    for (const folderName of folderNames) {
      const folderPath = folderName;
      const folderRef = ref(storage, folderPath);

      const listResponse = await listAll(folderRef);
      if (
        listResponse.items.length === 0 &&
        listResponse.prefixes.length === 0
      ) {
        // Create a placeholder file to ensure the folder is recognized
        const placeholderRef = ref(storage, `${folderPath}/.keep`);
        await uploadString(placeholderRef, ""); // Upload an empty string as the file content
      }
    }

    res.status(201).send({
      created: true,
      message: `Folders for context '${context}' for user '${userId}' were created successfully.`,
    });
  } catch (error) {
    console.error("Error checking or creating folders:", error);
    res.status(500).send({
      message: "Error checking or creating folders.",
      error,
    });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single("image");

exports.uploadPhotoHandler = [
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).send({
          message: "Error uploading file.",
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    const { path: requestedPath } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send({
        message: "No image file provided.",
      });
    }

    const storage = getStorageInstance();
    const keepFileRef = ref(storage, `${requestedPath}/.keep`);

    try {
      await getMetadata(keepFileRef);

      // If we reach this point, the .keep file exists, and the path is valid

      // Convert the uploaded image to PNG using sharp
      const pngBuffer = await sharp(file.buffer)
        .png() // Convert to PNG format
        .toBuffer();

      // Define the path for the image in Firebase Storage
      // TODO: isProfile for handling profile pics case, keeping the handler general 
      const imageRef = ref(storage, `${requestedPath}/profile.png`);

      // Upload the converted PNG image to Firebase Storage
      await uploadBytes(imageRef, pngBuffer);

      const downloadURL = await getDownloadURL(imageRef);

      res.status(201).send({
        message: `Image uploaded successfully to '${requestedPath}'.`,
        downloadURL,
      });
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        // .keep file does not exist, meaning the path is not valid
        res.status(404).send({
          message: `The path '${requestedPath}' does not exist.`,
        });
      } else {
        // Some other error occurred
        console.error("Error checking path or uploading image:", error);
        res.status(500).send({
          message: "Error checking path or uploading image.",
          error,
        });
      }
    }
  },
];

exports.retrieveImage = async (req, res) => {
  const { imageName, requestedPath } = req.body;

  try {
    // Initialize Firebase Storage
    const storage = getStorage();
    const imageRef = ref(storage, `${requestedPath}/${imageName}`);

    // Try to get the download URL for the image
    const downloadURL = await getDownloadURL(imageRef);

    // If successful, send the download URL as the response
    res.status(200).send({
      message: "Image retrieved successfully.",
      downloadURL,
    });
  } catch (error) {
    // If there's an error, send the error code and message as the response
    res.status(500).send({
      message: "Error retrieving image.",
      errorCode: error.code,
      errorMessage: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

