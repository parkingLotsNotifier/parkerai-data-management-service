const mongoose = require("mongoose");

const dailyOperationHoursSchema = new mongoose.Schema(
  {
    startingAt: {
      type: String,
      required: false,
    },
    endingAt: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

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
        message: (props) =>
          `Monthly sum of slots occupancy cannot be negative`,
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
        message: (props) =>
          `Monthly client usage counter cannot be negative`,
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
    operationHours: {
      monday: dailyOperationHoursSchema,
      tuesday: dailyOperationHoursSchema,
      wednesday: dailyOperationHoursSchema,
      thursday: dailyOperationHoursSchema,
      friday: dailyOperationHoursSchema,
      saturday: dailyOperationHoursSchema,
      sunday: dailyOperationHoursSchema,
    },
    isCapture: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ParkingLot = mongoose.model("ParkingLot", parkingLotSchema);

module.exports = ParkingLot;
