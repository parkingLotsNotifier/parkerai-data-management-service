const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema(
  {
    cameraAddr: {
      type: String,
      required: [true, "Camera address is required"],
      validate: {
        validator: function (v) {
          // Simple regex for validating an IP address and port format (basic validation)
          return /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/.test(v);
        },
        message: (props) => `${props.value} is not a valid camera address!`,
      },
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      minlength: [2, "Area must be at least 2 characters long"],
    },
    blueprint: {
      type: mongoose.Schema.Types.Mixed, // This allows for storing JSON data
      required: [true, "Blueprint must be assigned"],
    },
    cameraModel: {
      type: String,
      required: [false],
      minlength: [2, "Camera model must be at least 2 characters long"],
    },
    parkingLotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Parking lot ID is required"],
      ref: "ParkingLot",
    },
    cameraDocs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { timestamps: true }
);

const Camera = mongoose.model("Camera", cameraSchema);

module.exports = Camera;