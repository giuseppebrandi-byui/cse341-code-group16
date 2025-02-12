const express = require('express');
const router = express.Router();
const { patientValidationRules, validate } = require('../validation/validation-patients.js');
const patientsController = require('../controllers/patients');

router.get('/', patientsController.getAll);
router.get('/:id', patientsController.getSingle);
router.post("/", patientValidationRules(), validate, patientsController.createPatient);
router.put("/:id", patientValidationRules(), validate, patientsController.updatePatient);
router.delete("/:id", patientsController.deletePatient);

module.exports = router;