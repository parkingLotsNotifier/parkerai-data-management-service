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
  const { parkingLotId, name, location } = req.body;

  try {
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    if (name) parkingLot.name = name;
    if (location) parkingLot.location = location;

    await parkingLot.save();
    res.status(200).json({ message: "Parking lot updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error updating parking lot", error });
  }
};

// Delete a parking lot
exports.deleteParkingLot = async (req, res) => {
  const { parkingLotId } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not provided" });
  }

  try {
    const parkingLot = await ParkingLot.findByIdAndDelete(parkingLotId);

    if (parkingLot) {
      const user = await User.findById(userId);
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


