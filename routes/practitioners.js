const express = require('express');
const router = express.Router();
const { practitionerValidationRules, validate } = require('../validation/validation-practitioners.js');
const practitionersController = require('../controllers/practitioners');

router.get('/', practitionersController.getAll);
router.get('/:id', practitionersController.getSingle);
router.post('/', practitionerValidationRules(), validate, practitionersController.createPractitioner);
router.put('/:id', practitionerValidationRules(), validate, practitionersController.updatePractitioner);
router.delete('/:id', practitionersController.deletePractitioner);
router.get('/zip/:zip', practitionersController.getByZip);

module.exports = router;