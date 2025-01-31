const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

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

module.exports = {getAll, getSingle}