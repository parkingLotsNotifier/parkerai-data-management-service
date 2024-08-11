const ParkingLot = require("../models/ParkingLot");
const User = require("../models/User");

// Add a new parking lot
exports.addParkingLot = async (req, res) => {
  const { name, location } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not provided" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newParkingLot = new ParkingLot({ name, location, user: userId });
    await newParkingLot.save();

    user.parkingLots.push(newParkingLot._id);
    await user.save();

    res.status(201).json({ message: "Parking lot added successfully", parkingLotId: newParkingLot._id });
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
        user.parkingLots = user.parkingLots.filter(id => id.toString() !== parkingLotId);
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
