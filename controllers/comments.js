const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;

const getAll = async (req, res) => {
  //#swagger.tags=['All Comments']
  const result = await mongodb.getDatabase().db().collection('comments').find();
  result.toArray().then((comments) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(comments);
  });
};

const getSingle = async (req, res) => { 
  //#swagger.tags=['Single Comment']
  const commentId = ObjectId.createFromHexString(req.params.id);
  const result = await mongodb.getDatabase().db().collection('comments').find({ _id: commentId });
    result.toArray().then((comments) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(comments[0]);
    });
};

const createComment = async (req, res) => {
  //#swagger.tags=['Comments']
  const comment = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    comment: req.body.comment,
  };
  const response = await mongodb
    .getDatabase()
    .db()
    .collection("comments")
    .insertOne(comment);
  if (response.acknowledged) {
    res.status(204).send();
  } else {
    res
      .status(500)
      .json(
        response.error || "Some error occurred while creating the comment."
      );
  }
};

const updateComment = async (req, res) => {
    try {
    const commentId = ObjectId.createFromHexString(req.params.id);

    const data = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        comment: req.body.comment,
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection("comments")
      .replaceOne({ _id: commentId }, data);

    if (!response.acknowledged || response.modifiedCount === 0) {
      return res
        .status(500)
        .json("Some error ocurred while updating the comment.");
    }
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json("Some error ocurred while updating the comment.");
  }

  res.status(204).send();
};


const deleteComment = async (req, res) => {
  //#swagger.tags=['Comments']
  const commentId = ObjectId.createFromHexString(req.params.id);
  const response = await mongodb
    .getDatabase()
    .db()
    .collection("comments")
    .deleteOne({ _id: commentId });
  if (response.deletedCount > 0) {
    res.status(204).send();
  } else {
    res
      .status(500)
      .json(
        response.error || "Some error occurred while deleting the comment."
      );
  }
};

module.exports = {
  getAll,
  getSingle,
  createComment,
  updateComment,
  deleteComment
};
