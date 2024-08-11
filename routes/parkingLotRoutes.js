const express = require('express');
const parkingLotController = require('../controllers/parkingLotController');
const router = express.Router();

// Routes for parking lot operations
router.post('/add', parkingLotController.addParkingLot);
router.post('/update', parkingLotController.updateParkingLot);
router.post('/delete', parkingLotController.deleteParkingLot);

module.exports = router;
