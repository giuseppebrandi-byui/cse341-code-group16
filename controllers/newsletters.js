const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
  /*
    #swagger.summary='Gets all the newsletters'
    #swagger.description='Gets all the newsletters'
    
    #swagger.responses[200] = {
       description: 'OK',
       schema: [{ $ref: '#/definitions/Newsletter' }]
     } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */

  const result = await mongodb.getDatabase().db().collection('newsletters').find();
  result.toArray().then((newsletters) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(newsletters);
  });
};

const getSingle = async (req, res) => { 
  /*
    #swagger.summary='Gets a single newsletter by id'
    #swagger.description='Gets a single newsletter by id'
    
    #swagger.responses[200] = {
       description: 'OK',
       schema: { $ref: '#/definitions/Newsletter' }
    } 

    #swagger.responses[500] = {description: 'Internal Server Error'}
  */

  const newsletterId = ObjectId.createFromHexString(req.params.id);
  const result = await mongodb.getDatabase().db().collection('newsletters').find({ _id: newsletterId });
    result.toArray().then((newsletters) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(newsletters[0]);
    });
};

const createNewsLetter = async(req, res) => {
    /*
        #swagger.summary='Creates a newsletter'
        #swagger.description='Creates a newsletter'
        
        #swagger.responses[204] = {description: 'Created successfully'}

        #swagger.responses[500] = {description: 'Some error occurred while updating the newsletter.'}
     */

    const newsletter = {
        name: req.body.name,
        email: req.body.email
    };
    const response = await mongodb.getDatabase().db().collection('newsletters').insertOne(newsletter);
    if (response.acknowledged) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while updating the newsletter.');
    }
};

const updateNewsLetter = async (req, res) => {
    /*
      #swagger.summary='Updates a newsletter'
      #swagger.description='Updates a newsletter'
       
      #swagger.responses[204] = {description: 'Updated successfully'}

      #swagger.responses[500] = {description: 'Some error ocurred while updating the newsletter.'}
    */
      try {
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

        if (!response.acknowledged || response.modifiedCount === 0) {
            return res
                .status(500)
                .json("Some error ocurred while updating the newsletter.");
        }
    } catch (error) {
        console.error(error);

        return res
            .status(500)
            .json("Some error ocurred while updating the newsletter.");
    }

    res.status(204).send();
};

const deleteNewsLetter = async(req, res) => {
    /*
      #swagger.summary='Deletes a newsletter'
      #swagger.description='Deletes a newsletter'
        
      #swagger.responses[204] = {description: 'Deleted successfully'}

      #swagger.responses[500] = {description: 'Some error occurred while deleting the newsletter.'}
    */
    const newsletterId = ObjectId.createFromHexString(req.params.id);
    const response = await mongodb.getDatabase().db().collection('newsletters').deleteOne({_id : newsletterId});
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while deleting the newsletter.');
    }
};

module.exports = {
    getAll,
    getSingle,
    createNewsLetter,
    updateNewsLetter,
    deleteNewsLetter
};