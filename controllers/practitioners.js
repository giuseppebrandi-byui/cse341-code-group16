const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const createError = require('http-errors');

const getByZip = async (req, res, next) => { 
  /*
    #swagger.summary='Gets all the practitioners by Zip'
    #swagger.description='Gets all the practitioners by Zip'
    
    #swagger.responses[400] = {description: 'No practitioners found.'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: [{ $ref: '#/definitions/Practitioner' }]
     } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
 try {
   const practitionerZip = req.params.zip;
   const result = await mongodb.getDatabase().db().collection('practitioners').find({'address.zip': practitionerZip });
   result.toArray().then((practitioners) => {
    if (practitioners.length === 0 || !practitioners) {
      next(createError(400, 'No practitioners found.'))
      return;
    }
     res.setHeader('Content-Type', 'application/json');
     res.status(200).json(practitioners);
    });
  } catch (error){
    next(createError(500, 'Internal Server Error'))
  }
};

const getAllZips = async (req, res, next) => { 
  /*
    #swagger.summary='Gets all the zip codes on the database'
    #swagger.description='Gets all the zip codes on the database'
    
    #swagger.responses[400] = {description: 'No zip codes found.'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: {"zips": ["1234"]}
     } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  try {
    const result = await mongodb.getDatabase().db().collection('practitioners').find();
    result.toArray().then((practitioners) => {
      const allZips = practitioners.flatMap((prt) => prt.address.zip);
      const uniqueZips = new Set(allZips);
      const distructedZips = [...uniqueZips];
      if (distructedZips.length === 0) {
        next(createError(400, 'No zip codes found.'))
        return;          
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({'zips' :  distructedZips });
    });
  } catch (error){
    next(createError(500, 'Internal Server Error'))
  }
}

const getAll = async (req, res, next) => {
  /*
    #swagger.summary='Gets all the practitioners'
    #swagger.description='Gets all the practitioners'
    
    #swagger.responses[400] = {description: 'No practitioners found.'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: [{ $ref: '#/definitions/Practitioner' }]
    } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  
    try{
        const result = await mongodb.getDatabase().db().collection('practitioners').find();
        result.toArray().then((practitioners) => {
          if(practitioners.length === 0 || !practitioners) {
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

const getSingle = async (req, res, next) => {
  /*
    #swagger.summary='Gets a single practitioner by id'
    #swagger.description='Gets a single practitioner by id'

    #swagger.responses[400] = {description: 'Invalid record ID or no practitioner found with entered ID'}
    
    #swagger.responses[200] = {
       description: 'OK',
       schema: { $ref: '#/definitions/Practitioner' }
    } 

    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  
    if(!(req.params.id && req.params.id.length === 24)) {
        next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
        return;
    }
    try {
        const practitionerId = ObjectId.createFromHexString(req.params.id);
        const result = await mongodb.getDatabase().db().collection('practitioners').find({_id: practitionerId});
        result.toArray().then((practitioners) => {
            if(practitioners.length === 0 || !practitioners) {
                next(createError(400, 'No practitioner found with entered ID'));
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(practitioners[0]);
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

        #swagger.security = [{OAuth2:["user"]}]
        
        #swagger.responses[201] = {description: 'A new practitioner has been added to the database'}
        
        #swagger.responses[400] = {description: 'Some error occurred while creating the practitioner record.'}
        
        #swagger.responses[500] = {description: 'Internal Server Error'}
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

    #swagger.security = [{OAuth2:["user"]}]

    #swagger.responses[400] = {description: 'Invalid record ID or no practitioner record found with that id.'}
     
    #swagger.responses[201] = {description: 'The practitioner record has been updated successfully'}

    #swagger.responses[500] = {description: 'Something went wrong while updating the practitioner record. Please check id.'}
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
        'message': 'The practitioner record has been updated successfully',
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

      #swagger.security = [{OAuth2:["user"]}]

      #swagger.responses[400] = {description: 'Invalid record ID or no practitioner record found with entered id.'}
        
      #swagger.responses[201] = {description: 'The practitioner record has been deleted successfully.'}

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
        'message': 'The practitioner record has been deleted successfully.',
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
