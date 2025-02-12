const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const createError = require('http-errors');

const getAll = async (req, res) => { 
  const result = await mongodb.getDatabase().db().collection('patients').find();
  result.toArray().then((patients) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(patients);
  });
};

const getSingle = async (req, res) => { 
  const patientId = ObjectId.createFromHexString(req.params.id);
  const result = await mongodb.getDatabase().db().collection('patients').find({ _id: patientId });
    result.toArray().then((patients) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(patients[0]);
    });
};

const createPatient = async (req, res, next) => {
  /*
    #swagger.summary='Creates a patient'
    #swagger.description='Creates a patient'
    
    #swagger.responses[204] = {description: 'Patient created successfully'}

    #swagger.responses[500] = {description: 'Some error occurred while creating the patient.'}
  */
  
  try {
    const patient = {
      name: req.body.name,
      dob: req.body.dob,
      email: req.body.email,
      address: {
        street: req.body.address.street,
        city: req.body.address.city,
        zip: req.body.address.zip
      },
      phone: req.body.phone,
      insurer: req.body.insurer,
      request: req.body.request,
    };
    const response = await mongodb
      .getDatabase()
      .db()
      .collection("patients")
      .insertOne(patient);
    if (response.acknowledged) {
      res.status(201).json({
        'message': 'A new patient has been added to the database',
        'added patient': patient,
      });
    } else {
      next(createError(400, 'Some error occurred while creating the new patient.'));
      return;
    }
  } catch (error) { 
    next(createError(500, 'Internal Server Error.' + error.toString()));
    return;
  }
};

const updatePatient = async (req, res, next) => {
  /*
    #swagger.summary='Updates a patient'
    #swagger.description='Updates a patient'
    
    #swagger.responses[204] = {description: 'Updated patient successfully'}

    #swagger.responses[500] = {description: 'Some error ocurred while updating the patient.'}
  */
  try {
    if (!(req.params.id && req.params.id.length === 24)) {
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
    }
    const patientId = ObjectId.createFromHexString(req.params.id);
    const data = {
      name: req.body.name,
      dob: req.body.dob,
      email: req.body.email,
      address: {
        street: req.body.address.street,
        city: req.body.address.city,
        zip: req.body.address.zip
      },
      phone: req.body.phone,
      insurer: req.body.insurer,
      request: req.body.request,
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection("patients")
      .replaceOne({ _id: patientId }, data);

    if (response.modifiedCount > 0) {
      res.status(201).json({
        'message: ': 'Patient has been updated successfully',
        'updated patient: ': data
      })
    } else { 
      next(createError(400, 'No patient with that id'));
      return
    }
  } catch (error) {
    next(createError(500, 'Something went wrong while updating the patient. Please check id.'))
    return;
  }
};

const deletePatient = async (req, res, next) => {
  /*
    #swagger.summary='Deletes a patient'
    #swagger.description='Deletes a patient'
    
    #swagger.responses[204] = {description: 'Deleted patient successfully'}

    #swagger.responses[500] = {description: 'Some error occurred while deleting the patient.'}
  */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) {
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
    }
    const patientId = ObjectId.createFromHexString(req.params.id);
    const response = await mongodb
      .getDatabase()
      .db()
      .collection("patients")
      .deleteOne({ _id: patientId }, true);
    if (response.deletedCount > 0) {
      res.status(201).json({
        'message: ': 'The patient has been deleted successfully.',
      });
    } else {
        next(createError(400, 'Sorry no patient with entered id.'));
        return;
    }
  } catch (error) { 
    next(createError(500, 'Some error occurred while deleting the patient.'));
    return;
  }
};

module.exports = {getAll, getSingle, createPatient, updatePatient, deletePatient}