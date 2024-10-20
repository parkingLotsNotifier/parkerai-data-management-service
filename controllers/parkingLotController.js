const ParkingLot = require("../models/ParkingLot");
const User = require("../models/User");



// Add a new parking lot
exports.addParkingLot = async (req, res) => {
  const { ownerUserId } = req.body;
  console.log("🚀 ~ exports.addParkingLot= ~ req.body:", req.body);

  if (!ownerUserId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not provided" });
  }

  try {
    const user = await User.findById(ownerUserId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newParkingLot = new ParkingLot({ ...req.body });
    await newParkingLot.save();

    user.parkingLots.push(newParkingLot._id);
    await user.save();

    res.status(201).json({
      message: "Parking lot added successfully",
      parkingLotId: newParkingLot._id,
    });
  } catch (error) {
    res.status(400).json({ message: "Error adding parking lot", error });
  }
};

// Update a parking lot
exports.updateParkingLot = async (req, res) => {
  const { parkingLotId, ownerUserId, ...updateData } = req.body;
  console.log("🚀 ~ exports.updateParkingLot= ~ parkingLotId:", parkingLotId)
  console.log("🚀 ~ exports.updateParkingLot= ~ updateData:", updateData)
  // console.log("🚀 ~ exports.updateParkingLot= ~ ownerUserId:", ownerUserId)

  if (!ownerUserId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not provided" });
  }

  try {
    const user = await User.findById(ownerUserId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    if (parkingLot.ownerUserId.toString() !== ownerUserId) {
      return res.status(403).json({ message: "Unauthorized: You don't have permission to update this parking lot" });
    }
    Object.assign(parkingLot, updateData);
    await parkingLot.save();

    res.status(200).json({
      message: "Parking lot updated successfully",
      parkingLotId: parkingLot._id,
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating parking lot", error });
  }
};

// Delete a parking lot
exports.deleteParkingLot = async (req, res) => {
  const { parkingLotId: { parkingLotId, ownerUserId } = {} } = req.body;

  console.log("🚀 ~ exports.deleteParkingLot ~ parkingLotId:", parkingLotId);
  console.log("🚀 ~ exports.deleteParkingLot ~ ownerUserId:", ownerUserId);
  //const { ownerUserId } = req.user;
  //const userId = req.cookies.userId;
  //console.log("🚀 ~ exports.deleteParkingLot ~ userId:", userId)

  if (!ownerUserId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not provided" });
  }

  try {
    const parkingLot = await ParkingLot.findByIdAndDelete(parkingLotId);

    if (parkingLot) {
      const user = await User.findById(ownerUserId);
      if (user) {
        user.parkingLots = user.parkingLots.filter(
          (id) => id.toString() !== parkingLotId
        );
        await user.save();
      }
      res.status(200).json({ message: "Parking lot deleted successfully" });
    } else {
      res.status(404).json({ message: "Parking lot not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error deleting parking lot", error });
  }
};

exports.updateParkingLotFieldHandler = async (req, res) => {
  const { parkingLotId, fieldName, fieldValue, operation } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(parkingLotId)) {
      return res.status(400).send("Invalid Parking Lot ID");
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

    const result = await ParkingLot.updateOne(
      { _id: parkingLotId },
      updateObject,
      { runValidators: true }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .send("Parking lot not found or field not modified");
    }

    res.status(200).send("Parking lot field updated successfully");
  } catch (err) {
    res.status(500).send("Error updating parking lot field: " + err.message);
  }
};

// Get all parking lots by user ID
exports.getAllParkingLotsByUserId = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "Bad Request: User ID not provided" });
  }

  try {
    const user = await User.findById(userId).populate("parkingLots");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const parkingLotIds = user.parkingLots;

    if (parkingLotIds.length === 0) {
      return res.status(200).json({
        message: "No parking lots found for this user",
        parkingLots: [],
      });
    }

    const parkingLots = await ParkingLot.find({ _id: { $in: parkingLotIds } });

    res.status(200).json(parkingLots);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving parking lots", error });
  }
};

exports.createParkingLotFolderStructureHandler = async (req, res) => {
  const { userId, parkingLotId } = req.body;

  const storage = getStorageInstance();

  const folderNames = [
    `${userId}/myparkinglots/${parkingLotId}/`,
  ];

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
      message: `Folders for parkinkLot '${parkingLotId}' were created successfully.`,
    });
  } catch (error) {
    console.error("Error checking or creating folders:", error);
    res.status(500).send({
      message: "Error checking or creating folders.",
      error,
    });
  }
};

exports.addCameraToParkingLot = async (parkingLotId, cameraId) => {
  try {
    await ParkingLot.findByIdAndUpdate(
      parkingLotId,
      { $addToSet: { cameraIds: cameraId } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error("Error adding camera to parking lot:", error);
    throw error;
  }
};

exports.removeCameraFromParkingLot = async (parkingLotId, cameraId) => {
  try {
    await ParkingLot.findByIdAndUpdate(
      parkingLotId,
      { $pull: { cameraIds: cameraId } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error("Error removing camera from parking lot:", error);
    throw error;
  }
};

exports.addParkingSlotNames = async (parkingLotId, names) => {
  try {
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      throw new Error("Parking lot not found");
    }

    const existingNames = new Set(parkingLot.parkingSlotsNames);
    const duplicateNames = names.filter(name => existingNames.has(name));

    if (duplicateNames.length > 0) {
      return {
        error: `The following parking slot names already exist in the parking lot: ${duplicateNames.join(', ')}. Please upload a blueprint with unique names.`
      };
    }

    parkingLot.parkingSlotsNames = [...new Set([...parkingLot.parkingSlotsNames, ...names])];
    await parkingLot.save();
    return { success: true };
  } catch (error) {
    console.error("Error adding parking slot names:", error);
    throw error;
  }
};

exports.removeParkingSlotNames = async (parkingLotId, names) => {
  try {
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      throw new Error("Parking lot not found");
    }

    parkingLot.parkingSlotsNames = parkingLot.parkingSlotsNames.filter(name => !names.includes(name));
    await parkingLot.save();
  } catch (error) {
    console.error("Error removing parking slot names:", error);
    throw error;
  }
};

exports.searchParkingLotHandler = async (req,res) =>{
  try{
    const query = req.body;
    const parkingLots = await ParkingLot.find(query);  
    return res.status(200).send({parkingLots});
  }catch(error){
    return res.status(400).send({message:"Error find Active Monitoring ParkingLots", error});
  }
}


