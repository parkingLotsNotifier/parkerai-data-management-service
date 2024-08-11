const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;

// Define the Coordinate schema
const CoordinateSchema = new Schema({
    x1: Number,
    y1: Number,
    w: Number,
    h: Number,
    center: {
        x: Number,
        y: Number
    }
});

// Define the Prediction schema
const PredictionSchema = new Schema({
    class: String,
    confidence: Number
});

// Define the Slot schema
const SlotSchema = new Schema({
    file_name: String,
    coordinate: CoordinateSchema,
    prediction: PredictionSchema,
    average_intensity : Number,
    lot_name: String,
    roi: {
        type: String, // Base64 string
        required: false
    },
    variants: [] 
});

// Define the main schema
const DocumentSchema = new Schema({
    file_name: String,
    slots: [SlotSchema],
    parking_name: String 
},{timestamps : true});

// Create the model
const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
