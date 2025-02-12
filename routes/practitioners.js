const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../auth/authenticate');
const { practitionerValidationRules, validate } = require('../validation/validation-practitioners.js');
const practitionersController = require('../controllers/practitioners');

router.get('/', practitionersController.getAll);
router.get('/:id', practitionersController.getSingle);
router.post('/', isAuthenticated, practitionerValidationRules(), validate, practitionersController.createPractitioner);
router.put('/:id', isAuthenticated, practitionerValidationRules(), validate, practitionersController.updatePractitioner);
router.delete('/:id', isAuthenticated, practitionersController.deletePractitioner);
router.get('/zip/:zip', practitionersController.getByZip);

module.exports = router;