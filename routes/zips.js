const express = require('express');
const router = express.Router();
const practitionersController = require('../controllers/practitioners');

router.get('/', practitionersController.getAllZips);


module.exports = router;