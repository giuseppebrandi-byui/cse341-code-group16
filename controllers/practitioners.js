const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const createError = require('http-errors');

const getByZip = async (req, res) => { 
  const practitionerZip = req.params.zip;
  const result = await mongodb.getDatabase().db().collection('practitioners').find({'address.zip': practitionerZip });
  result.toArray().then((practitioners) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(practitioners);
    });
};

const getAllZips = async (req, res) => { 
  const result = await mongodb.getDatabase().db().collection('practitioners').find();
  result.toArray().then((practitioners) => {
    const allZips = practitioners.flatMap((prt) => prt.address.zip);
    const uniqueZips = new Set(allZips);
    const distructedZips = [...uniqueZips];
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({'zips' :  distructedZips });
  });
}

const getAll = async(req, res, next) => {
    try{
        const result = await mongodb.getDatabase().db().collection('practitioners').find();
        result.toArray().then((practitioners) => {
            if(practitioners.lenght === 0 || !practitioners) {
                next(createError(400, 'No practitioners found.'));
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(practitioners);
        });
    } catch (error) {
        next(createError(500, 'Internal Server Error'));
        return;
    }
};

const getSingle = async(req, res, next) => {
    if(!(req.params.id && req.params.id.lenght === 0)) {
        next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
        return;
    }
    try {
        const practitionerId = ObjectId.createFromHexString(req.params.id);
        const result = await mongodb.getDatabase().db().collection('practitioners').find({_id: practitionerId});
        result.toArray().then((practitioner) => {
            if(practitioner.lenght === 0 || !practitioner) {
                next(createError(400, 'No practiotioner found with entered ID'));
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(practitioner);
        })
    } catch (error) {
        next(createError(500, 'Internal Server Error'));
        return;
    }
}

const createPractitioner = async (req, res, next) => {
  
    /*
        #swagger.summary='Creates a practitioner'
        #swagger.description='Creates a practitioner'
        
        #swagger.responses[204] = {description: 'Created practitioner successfully'}

        #swagger.responses[500] = {description: 'Some error occurred while creating the practitioner record.'}
     */

  try {
    const practitioner = {
      name: req.body.name,
      specialization: req.body.specialization,
      dea_number: req.body.dea_number,
      address: { 
        street: req.body.address.street,
        city: req.body.address.city,
        zip: req.body.address.zip
      },
      phone: req.body.phone,
      email: req.body.email
    };
    const response = await mongodb.getDatabase().db().collection('practitioners').insertOne(practitioner);
    if (response.acknowledged) {
      res.status(201).json({
        'message': 'A new practitioner has been added to the database',
        'added practitioner': practitioner,
      });
    } else {
      next(createError(400, 'Some error occurred while creating the practitioner record.'));
      return;
    }
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const updatePractitioner = async (req, res, next) => {

  /*
    #swagger.summary='Updates a practitioner record'
    #swagger.description='Updates a practitioner record'
     
    #swagger.responses[204] = {description: 'Updated practitioner record successfully'}

    #swagger.responses[500] = {description: 'Some error ocurred while updating the practitioner record.'}
  */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) {
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
    }
    const practitionerId = ObjectId.createFromHexString(req.params.id);
    const data = {
      name: req.body.name,
      specialization: req.body.specialization,
      dea_number: req.body.dea_number,
      address: { 
        street: req.body.address.street,
        city: req.body.address.city,
        zip: req.body.address.zip
      },
      phone: req.body.phone,
      email: req.body.email
    };
    const response = await mongodb
      .getDatabase()
      .db()
      .collection("practitioners")
      .replaceOne({ _id: practitionerId }, data);
    if (response.modifiedCount > 0) {
      res.status(201).json({
        'message: ': 'The practitioner record has been updated successfully',
        'updated practitioner record: ': data
      });
    } else {
      next(createError(400, 'No practitioner record found with that id.'));
      return;
    }
  } catch (error) {
    next(createError(500, 'Something went wrong while updating the practitioner record. Please check id.'));
    return;
  }
}

const deletePractitioner = async (req, res, next) => {
    /*
      #swagger.summary='Deletes a practitioner record'
      #swagger.description='Deletes a practitioner record'
        
      #swagger.responses[204] = {description: 'Practitioner record deleted successfully'}

      #swagger.responses[500] = {description: 'Some error occurred while deleting the practitioner record.'}
    */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) { 
    next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
    return;
  }
    const practitionerId = ObjectId.createFromHexString(req.params.id);
    const response = await mongodb.getDatabase().db().collection('practitioners').deleteOne({_id : practitionerId}, true);
    if (response.deletedCount > 0) {
      res.status(201).json({
        'message: ': 'The practitioner record has been deleted successfully.',
      });
    } else {
        next(createError(400, 'Sorry no practitioner record found with entered id.'));
        return;
    }
  } catch (error) { 
    next(createError(500, 'Some error occurred while deleting the practitioner record.'));
    return;
  }
};

module.exports = {getAll, getSingle, getByZip, getAllZips, createPractitioner, updatePractitioner, deletePractitioner}
