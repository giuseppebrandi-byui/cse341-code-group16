const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../auth/authenticate');
const { patientValidationRules, validate } = require('../validation/validation-patients.js');
const patientsController = require('../controllers/patients');

router.get('/', patientsController.getAll);
router.get('/:id', patientsController.getSingle);
router.post("/", isAuthenticated, patientValidationRules(), validate, patientsController.createPatient);
router.put("/:id", isAuthenticated, patientValidationRules(), validate, patientsController.updatePatient);
router.delete("/:id", isAuthenticated, patientsController.deletePatient);

module.exports = router;