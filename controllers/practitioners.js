const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

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

module.exports = {getByZip, getAllZips}