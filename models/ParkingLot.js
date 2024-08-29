const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema(
  {
    parkingLotName: {
      type: String,
      required: [true, "Parking lot name is required"],
      minlength: [3, "Parking lot name must be at least 3 characters long"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      minlength: [5, "Address must be at least 5 characters long"],
    },
    hourlyParkingCost: {
      type: Number,
      required: [true, "Hourly parking cost is required"],
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: (props) => `Hourly parking cost must be greater than zero`,
      },
    },
    operationHours: {
      startingAt: {
        type: Date,
        required: [true, "Operation start time is required"],
      },
      endingAt: {
        type: Date,
        required: [true, "Operation end time is required"],
      },
    },
    numberOfParkingSlot: {
      type: Number,
      required: [true, "Number of parking slots is required"],
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: (props) => `Number of parking slots must be greater than zero`,
      },
    },
    updateInterval: {
      type: Number,
      required: [true, "Update interval is required"],
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: (props) => `Update interval must be greater than zero`,
      },
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Owner user ID is required"],
      ref: "User",
    },
    dailySumSlotsOccupency: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) => `Daily sum of slots occupancy cannot be negative`,
      },
    },
    dailyEstimatedRevenue: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) => `Daily estimated revenue cannot be negative`,
      },
    },
    monthlySumSlotsOccupency: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) => `Monthly sum of slots occupancy cannot be negative`,
      },
    },
    monthlyEstimatedRevenue: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) => `Monthly estimated revenue cannot be negative`,
      },
    },
    sumCurrOcupiedSlots: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) =>
          `Sum of currently occupied slots cannot be negative`,
      },
    },
    monthlyClientUsageCounter: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) => `Monthly client usage counter cannot be negative`,
      },
    },
    parkingSlotsNames: {
      type: [String],
    },
    cameraIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Camera",
      },
    ],
  },
  { timestamps: true }
);

const ParkingLot = mongoose.model("ParkingLot", parkingLotSchema);

module.exports = ParkingLot;
