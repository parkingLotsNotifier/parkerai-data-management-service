const mongoose = require('mongoose');

// Schema for operating hours of a single day
const OperationHourSchema = new mongoose.Schema({
  startingAt: { type: String, required: true }, // Format "HH:mm"
  endingAt: { type: String, required: true },   // Format "HH:mm"
}, { _id: false }); // Disable _id for this sub-document

// Schema for a camera
const CameraSchema = new mongoose.Schema({
  cameraId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Camera' },
  cameraUrl: { type: String, required: true },
}, { _id: false }); // Disable _id for this sub-document

// Main schema for the scheduler task
const SchedulerTaskSchema = new mongoose.Schema({
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ParkingLot' },
  operationHours: {
    monday: { type: OperationHourSchema, required: false },
    tuesday: { type: OperationHourSchema, required: false },
    wednesday: { type: OperationHourSchema, required: false },
    thursday: { type: OperationHourSchema, required: false },
    friday: { type: OperationHourSchema, required: false },
    saturday: { type: OperationHourSchema, required: false },
    sunday: { type: OperationHourSchema, required: false },
  },
  intervalTime: { type: String, required: true }, // E.g., "10s", "5m"
  cameras: { type: [CameraSchema], required: true },
});

module.exports = mongoose.model('SchedulerTask', SchedulerTaskSchema);
