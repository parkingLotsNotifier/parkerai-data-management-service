const mongoose = require("mongoose");
const { isEmail } = require("validator");

const enumRolles = {
  user: 0,
  admin: 1,
  parkingLotOwner: 2,
  developer: 3,
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter a username"],
      validate: {
        validator: function (v) {
          return v && v.trim().length > 3;
        },
        message: "Please enter numbers/letters ",
      },
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Minimum password length is 8 characters"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters long"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 2 characters long"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      minlength: [2, "Company name must be at least 2 characters long"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    refreshToken: [
      {
        type: String,
        required: true,
        unique: true,
      },
    ],
    role: {
      type: String,
      enum: {
        values: Object.values(enumRolles),
        message:
          'User role must be either "user" or "parkingLotOwner" or "admin"',
      },
      default: 1,
    },
    parkingLots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingLot",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
