const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must be assigned']
  },
  location: {
    type: String,
    required: [true, 'Location must be assigned']
  },
  cameraIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camera'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

module.exports = ParkingLot;
