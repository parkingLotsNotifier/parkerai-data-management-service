const mongoose = require('mongoose');

// Define the Camera schema
const cameraSchema = new mongoose.Schema({
  blueprint: {
    type: mongoose.Schema.Types.Mixed, // This allows for storing JSON data
    required: [true, 'Blueprint must be assigned']
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  model: {
    type: String,
    required: false
  }
});

// Export the Camera model
const Camera = mongoose.model('Camera', cameraSchema);

module.exports = Camera;
