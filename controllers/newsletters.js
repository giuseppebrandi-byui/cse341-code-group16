const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const createNewsLetter = async(req, res) => {
    //#swagger.tags=['News Letters']
    const newsletter = {
        name: req.body.name,
        email: req.body.email
    };
    const response = await mongodb.getDatabase().db().collection('newsletters').replaceOne(newsletter);
    if (response.acknowledged) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while updating the newsletter.');
    }
};

const deleteNewsLetter = async(req, res) => {
    //#swagger.tags=['News Letters']
    const newsletterId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('newsletters').deleteOne({_id : newsletterId});
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while deleting the newsletter.');
    }
};

const updateNewsLetter = async (req, res) => {
    try {
        const newsletterId = new ObjectId(req.params.id);

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

module.exports = {
    // getAll, // This is commented because it causes a not defined error
    // getSingle,
    createNewsLetter,
    updateNewsLetter,
    deleteNewsLetter
};