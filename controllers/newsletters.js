const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const createError = require('http-errors');

const getAll = async (req, res, next) => {
  /*
    #swagger.summary='Gets all the newsletters subscribers'
    #swagger.description='Gets all the newsletters subscribers'
    
    #swagger.responses[200] = {
       description: 'OK',
       schema: [{ $ref: '#/definitions/Newsletter' }]
     } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  try {
    const result = await mongodb.getDatabase().db().collection('newsletters').find();
    result.toArray().then((newsletters) => {
      if (newsletters.length === 0 || !newsletters) {
        next(createError(400, 'No newsletters subscriber found.'))
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(newsletters);
    });
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const getSingle = async (req, res, next) => { 

  /*
    #swagger.summary='Gets a single newsletter by id'
    #swagger.description='Gets a single newsletter subscriber by id'
    
    #swagger.responses[200] = {
       description: 'OK',
       schema: { $ref: '#/definitions/Newsletter' }
    } 

    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  
  if (!(req.params.id && req.params.id.length === 24)) { 
    next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
    return;
  }

  try {
    const newsletterId = ObjectId.createFromHexString(req.params.id);
    const result = await mongodb.getDatabase().db().collection('newsletters').find({ _id: newsletterId });
    result.toArray().then((newsletters) => {
      if (newsletters.length === 0 || !newsletters) { 
        next(createError(400, 'No newsletter subscriber found with entered id.'));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(newsletters[0]);
    });
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const createNewsLetter = async (req, res, next) => {
  
    /*
        #swagger.summary='Creates a newsletter subscriber'
        #swagger.description='Creates a newsletter subscriber'
        
        #swagger.responses[204] = {description: 'Created newsletter subscriber successfully'}

        #swagger.responses[500] = {description: 'Some error occurred while updating the newsletter subscriber.'}
     */

  try {
    const newsletter = {
      name: req.body.name,
      email: req.body.email
    };
    const response = await mongodb.getDatabase().db().collection('newsletters').insertOne(newsletter);
    if (response.acknowledged) {
      res.status(201).json({
        'message': 'A newsletter subscriber has been added to the database',
        'added newsletter subscriber': newsletter,
      });
    } else {
      next(createError(400, 'Some error occurred while creating the newsletter subscriber.'));
      return;
    }
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const updateNewsLetter = async (req, res, next) => {

  /*
    #swagger.summary='Updates a newsletter'
    #swagger.description='Updates a newsletter subscriber'
     
    #swagger.responses[204] = {description: 'Updated newsletter subscriber successfully'}

    #swagger.responses[500] = {description: 'Some error ocurred while updating the newsletter subscriber.'}
  */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) {
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
    }
    const newsletterId = ObjectId.createFromHexString(req.params.id);
    const data = {
      name: req.body.name,
      email: req.body.email,
    };
    const response = await mongodb
      .getDatabase()
      .db()
      .collection("newsletters")
      .replaceOne({ _id: newsletterId }, data);
    if (response.modifiedCount > 0) {
      res.status(201).json({
        'message: ': 'Newsletter subscriber has been updated successfully',
        'updated newsletter subscriber: ': data
      });
    } else {
      next(createError(400, 'No newsletter subscriber with that id.'));
      return;
    }
  } catch (error) {
    next(createError(500, 'Something went wrong while updating the newsletter subscriber. Please check id.'));
    return;
  }
}  
     

const deleteNewsLetter = async (req, res, next) => {
    /*
      #swagger.summary='Deletes a newsletter subscriber'
      #swagger.description='Deletes a newsletter subscriber'
        
      #swagger.responses[204] = {description: 'Subscriber Deleted successfully'}

      #swagger.responses[500] = {description: 'Some error occurred while deleting the newsletter subscriber.'}
    */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) { 
    next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
    return;
  }
    const newsletterId = ObjectId.createFromHexString(req.params.id);
    const response = await mongodb.getDatabase().db().collection('newsletters').deleteOne({_id : newsletterId}, true);
    if (response.deletedCount > 0) {
      res.status(201).json({
        'message: ': 'The newsletter subscriber has been deleted successfully.',
      });
    } else {
        next(createError(400, 'Sorry no newsletter subscriber with entered id.'));
        return;
    }
  } catch (error) { 
    next(createError(500, 'Some error occurred while deleting the newsletter subscriber.'));
    return;
  }
};

module.exports = {
    getAll,
    getSingle,
    createNewsLetter,
    updateNewsLetter,
    deleteNewsLetter
};