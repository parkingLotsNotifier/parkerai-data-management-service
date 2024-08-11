const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Routes for user operations
router.post('/update', userController.updateUser);
router.post('/delete', userController.deleteUser);

module.exports = router;
