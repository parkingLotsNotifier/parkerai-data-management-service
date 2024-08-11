const express = require('express');
const documentController = require('../controllers/documentController');
const router = express.Router();

// Routes for document operations
router.post('/add', documentController.addDocument);
router.post('/update', documentController.updateDocument);
router.post('/delete', documentController.deleteDocument);

module.exports = router;
