const express = require('express');
const router = express.Router();
const practitionersController = require('../controllers/practitioners');

// router.get('/', practitionersController.getAll);
// router.get('/:id', practitionersController.getSingle);
router.get('/zip/:zip', practitionersController.getByZip);


module.exports = router;