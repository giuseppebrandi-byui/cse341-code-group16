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

const createPractitioner = async(req, res, next) => {
    try {
        const practitioner = {
            name: req.body.name,
            specialization: req.body.specialization,
            dea_number: req.body.dea_number,
            address: {
                street: req.body.street,
                city: req.body.city,
                zip: req.body.zip
            },
            phone: req.body.phone,
            email: req.body.email
        }
        const response = mongodb.getDatabase().db().collection('practitioners').insertOne(practitioner);
        if (response.acknowledged) {
            res.status(201).json({
                'message' : 'A practitioner has been added to the database',
                'added' : practitioner
            })
        } else {
            next(createError(400, 'Some error occurred while creating the newsletter subscriber.'));
            return;
        }
    } catch (error) {
        next(createError(500, 'Internal Server Error'));
        return;
    }
}

const updatePractitioner = async(req, res, next) => {
    try {
        if(!(req.params.id && req.params.id.lenght === 0)) {
            next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
            return;
        }
        const practitionerId = ObjectId.createFromHexString(req.params.id);
        const practitioner = {
            name: req.body.name,
            specialization: req.body.specialization,
            dea_number: req.body.dea_number,
            address: {
                street: req.body.street,
                city: req.body.city,
                zip: req.body.zip
            },
            phone: req.body.phone,
            email: req.body.email
        };
        const response = mongodb.getDatabase().db().collection('practitioners').replaceOne({_id: practitionerId}, practitioner);
        if (response.modifiedCount > 0) {
            res.status(201).json({
                'message' : 'A practitioner has been updated successfully',
                'updated practitioner' : practitioner
            });
        } else {
            next(createError(400, 'No practitioner found with that id'));
            return;
        }
    } catch (error) {
        next(createError(500, 'Some error occurred while updating the practitioner. Please check the id.'));
        return;
    }
}

const deletePractitioner = async(req, res, next) => {
    try {
        if(!(req.params.id && req.params.id.lenght === 0)) {
            next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
            return;
        };
        const practitionerId = ObjectId.createFromHexString(req.params.id);
        const response = mongodb.getDatabase().db().collection('practitioners').deleteOne({_id: practitionerId}, true);
        if (response.deletedCount > 0) {
            res.status(201).json({
                'message' : 'A practitioner has been deleted successfully',
            });
        } else {
            next(createError(400, 'No practitioner found with that id'));
            return;
        }
    } catch (error) {
        next(createError(500, 'Some error occurred while deleting the practitioner. Please check the id.'));
        return;
    }
}

module.exports = {
    getByZip,
    getAllZips,
    getAll,
    getSingle,
    createPractitioner,
    updatePractitioner,
    deletePractitioner
}