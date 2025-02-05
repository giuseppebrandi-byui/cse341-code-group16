const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;

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
    .replaceOne(comment);
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

const deleteComment = async (req, res) => {
  //#swagger.tags=['Comments']
  const commentId = new ObjectId(req.params.id);
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

const updateComment = async (req, res) => {
  const commentId = new ObjectId(req.params.id);

  const data = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    comment: req.body.comment,
  };

  try {
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

module.exports = {
  // getAll, // This is commented because it causes a not defined error
  // getSingle,
  createComment,
  updateComment,
  deleteComment,
};
