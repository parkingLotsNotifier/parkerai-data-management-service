const express = require('express');
const parkingLotController = require('../controllers/parkingLotController');
const router = express.Router();

// Routes for parking lot operations
router.post('/addParkingLot', parkingLotController.addParkingLot);
router.post('/updateParkingLot', parkingLotController.updateParkingLot);
router.post('/deleteParkingLot', parkingLotController.deleteParkingLot);
router.post('/updateParkingLotField', parkingLotController.updateParkingLotFieldHandler);
router.get('/getAllParkingLotsByUserId/:id',parkingLotController.getAllParkingLotsByUserId);
router.post('/createParkingLotFolderStructure',parkingLotController.createParkingLotFolderStructureHandler);

module.exports = router;
