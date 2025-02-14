const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const createError = require('http-errors');

const getAll = async (req, res, next) => { 
  /*
    #swagger.summary='Gets all the patients'
    #swagger.description='Gets all the patients'
    
    #swagger.responses[400] = {description: 'No patients found'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: [{ $ref: '#/definitions/Patient' }]
     } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  try {
    const result = await mongodb.getDatabase().db().collection('patients').find();
    result.toArray().then((patients) => {
      if (patients.length === 0 || !patients) { 
        next(createError(400, 'No patients found'));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(patients);
    });
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const getSingle = async (req, res, next) => {

  /*
    #swagger.summary='Gets a single patient by id'
    #swagger.description='Gets a single patient by id'
    
    #swagger.responses[400] = {description: 'Invalid record ID or no patient found with the entered id.'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: { $ref: '#/definitions/Patient' }
    } 

    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  
  if (!(req.params.id && req.params.id.length === 24)) {
    next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
    return;
  }

  try {
    const patientId = ObjectId.createFromHexString(req.params.id);
    const result = await mongodb.getDatabase().db().collection('patients').find({ _id: patientId });
    result.toArray().then((patients) => {
      if (patients.length === 0 || !patients) {
        next(createError(400, 'No patient found with the entered id.'));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(patients[0]);
    });
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const createPatient = async (req, res, next) => {
    /*
        #swagger.summary='Creates a patient'
        #swagger.description='Creates a patient'

        #swagger.security = [{OAuth2:["user"]}]

        #swagger.parameters['body'] = { in: 'body', schema: { name: "Sophia Adams",
          dob: "09/18/79",
          email: "sophia.adams@example.com",
          address: {
            street: "567 Maple Street",
            city: "Villageland",
            zip: "67890",
          },
          phone: "555-789-2345",
          insurer: "National",
          request:
            "Morbi posuere enim quis ornare laoreet. Donec imperdiet lacus odio, ut sollicitudin velit vulputate non. Sed mattis dolor purus, vel efficitur metus porta vel. Donec in aliquam nisl. Suspendisse venenatis eros molestie nunc eleifend, vel euismod elit tincidunt.",
        }}
        
        #swagger.responses[400] = {description: 'Some error occurred while creating the patient record.'}

        #swagger.responses[201] = {description: 'A new patient has been added to the database'}

        #swagger.responses[500] = {description: 'Internal Server Error'}
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
      request: req.body.request
    };
    const response = await mongodb.getDatabase().db().collection('patients').insertOne(patient);
    if (response.acknowledged) {
      res.status(201).json({
        'message': 'A new patient has been added to the database',
        'added patient': patient,
      });
    } else {
      next(createError(400, 'Some error occurred while creating the patient record.'));
      return;;
    }
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const updatePatient = async (req, res, next) => {
  /*
    #swagger.summary='Updates a patient record'
    #swagger.description='Updates a patient record'

    #swagger.security = [{OAuth2:["user"]}]

    #swagger.parameters['body'] = { in: 'body', schema: { name: "Sophia Adams",
          dob: "09/18/79",
          email: "sophia.adams@example.com",
          address: {
            street: "567 Maple Street",
            city: "Villageland",
            zip: "67890",
          },
          phone: "555-789-2345",
          insurer: "National",
          request:
            "Morbi posuere enim quis ornare laoreet. Donec imperdiet lacus odio, ut sollicitudin velit vulputate non. Sed mattis dolor purus, vel efficitur metus porta vel. Donec in aliquam nisl. Suspendisse venenatis eros molestie nunc eleifend, vel euismod elit tincidunt.",
    }}

    #swagger.responses[400] = {description: 'Invalid record ID or no patient record found with that id.'}

    #swagger.responses[201] = {description: 'The patient record has been updated successfully'}

    #swagger.responses[500] = {description: 'Something went wrong while updating the patient record. Please check id.'}
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
      request: req.body.request
    };
    const response = await mongodb
      .getDatabase()
      .db()
      .collection("patients")
      .replaceOne({ _id: patientId }, data);
    if (response.modifiedCount > 0) {
      res.status(201).json({
        'message': 'The patient record has been updated successfully',
        'updated patient record: ': data
      });
    } else {
      next(createError(400, 'No patient record found with that id.'));
      return;
    }
  } catch (error) {
    next(createError(500, 'Something went wrong while updating the patient record. Please check id.'));
    return;
  }
}

const deletePatient = async (req, res, next) => {
    /*
      #swagger.summary='Deletes a patient record'
      #swagger.description='Deletes a patient record'

      #swagger.security = [{OAuth2:["user"]}]

      #swagger.responses[400] = {description: 'Invalid record ID or no patient record found with that id.'}
        
      #swagger.responses[201] = {description: 'The patient record has been deleted successfully.'}

      #swagger.responses[500] = {description: 'Some error occurred while deleting the patient record.'}
    */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) { 
    next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
    return;
  }
    const patientId = ObjectId.createFromHexString(req.params.id);
    const response = await mongodb.getDatabase().db().collection('patients').deleteOne({_id : patientId}, true);
    if (response.deletedCount > 0) {
      res.status(201).json({
        'message': 'The patient record has been deleted successfully.',
      });
    } else {
        next(createError(400, 'Sorry no patient record found with entered id.'));
        return;
    }
  } catch (error) { 
    next(createError(500, 'Some error occurred while deleting the patient record.'));
    return;
  }
};

module.exports = {getAll, getSingle, createPatient, updatePatient, deletePatient}