const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
  //#swagger.tags=['All Newsletters']
  const result = await mongodb.getDatabase().db().collection('newsletters').find();
  result.toArray().then((newsletters) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(newsletters);
  });
};

const getSingle = async (req, res) => { 
  //#swagger.tags=['Single Newsletter']
  const newsletterId = ObjectId.createFromHexString(req.params.id);
  const result = await mongodb.getDatabase().db().collection('newsletters').find({ _id: newsletterId });
    result.toArray().then((newsletters) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(newsletters[0]);
    });
};

const createNewsLetter = async(req, res) => {
    //#swagger.tags=['News Letters']
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
    //#swagger.tags=['News Letters']
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