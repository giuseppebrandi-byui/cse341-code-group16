const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;
const createError = require('http-errors');

const getAll = async (req, res, next) => {
  /*
    #swagger.summary='Gets all the comments'
    #swagger.description='Gets all the comments'
    
    #swagger.responses[400] = {description: 'No comments found'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: [{ $ref: '#/definitions/Comment' }]
     } 
    
    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  try {
    const result = await mongodb.getDatabase().db().collection("comments").find();
    result.toArray().then((comments) => {
      if (comments.length === 0 || !comments) { 
        next(createError(400, 'No comments found'));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(comments);
    });
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const getSingle = async (req, res, next) => {
  /*
    #swagger.summary='Gets a single comment by id'
    #swagger.description='Gets a single comment by id'
    
    #swagger.responses[400] = {description: 'Invalid record ID or no comment found with the entered id.'}

    #swagger.responses[200] = {
       description: 'OK',
       schema: { $ref: '#/definitions/Comment' }
    } 

    #swagger.responses[500] = {description: 'Internal Server Error'}
  */
  
  if (!(req.params.id && req.params.id.length === 24)) { 
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
  }

  try {
    const commentId = ObjectId.createFromHexString(req.params.id);
    const result = await mongodb.getDatabase().db().collection('comments').find({ _id: commentId });
    result.toArray().then((comments) => {
      if (comments.length === 0 || !comments) {
        next(createError(400, 'No comment found with the entered id.'));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(comments[0]);
    });
  } catch (error) { 
    next(createError(500, 'Internal Server Error'));
    return;
  }
};

const createComment = async (req, res, next) => {
  /*
    #swagger.summary='Creates a comment'
    #swagger.description='Creates a comment'

    #swagger.security = [{OAuth2:["user"]}]
    
    #swagger.responses[201] = {description: 'Created successfully'}

    #swagger.responses[400] = {description: 'Some error occurred while creating the comment.'}
    #swagger.responses[500] = {description: 'Internal Server Error.'}
  */
  
  try {
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
      res.status(201).json({
        'message': 'A new comment has been added to the database',
        'added comment': comment,
      });
    } else {
      next(createError(400, 'Some error occurred while creating the new comment.'));
      return;
    }
  } catch (error) { 
    next(createError(500, 'Internal Server Error.' + error.toString()));
    return;
  }
};

const updateComment = async (req, res, next) => {
  /*
    #swagger.summary='Updates a comment'
    #swagger.description='Updates a comment'

    #swagger.security = [{OAuth2:["user"]}]
    
    #swagger.responses[400] = {description: 'Invalid record ID or no comment with that id'}
    
    #swagger.responses[201] = {description: 'UpdatedComment has been updated successfully'}

    #swagger.responses[500] = {description: 'Something went wrong while updating the comment. Please check id.'}
  */
  try {
    if (!(req.params.id && req.params.id.length === 24)) {
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
    }
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

    if (response.modifiedCount > 0) {
      res.status(201).json({
        'message': 'Comment has been updated successfully',
        'updated comment: ': data
      })
    } else { 
      next(createError(400, 'No comment with that id'));
      return
    }
  } catch (error) {
    next(createError(500, 'Something went wrong while updating the comment. Please check id.'))
    return;
  }
};

const deleteComment = async (req, res, next) => {
  /*
    #swagger.summary='Deletes a comment'
    #swagger.description='Deletes a comment'

    #swagger.security = [{OAuth2:["user"]}]
    
    #swagger.responses[400] = {description: 'Invalid record ID or no comment with that id'}

    #swagger.responses[201] = {description: 'Deleted successfully'}

    #swagger.responses[500] = {description: 'Some error occurred while deleting the comment.'}
  */
  
  try {
    if (!(req.params.id && req.params.id.length === 24)) {
      next(createError(400, 'Please enter a valid id with a string of 24 hex characters.'));
      return;
    }
    const commentId = ObjectId.createFromHexString(req.params.id);
    const response = await mongodb
      .getDatabase()
      .db()
      .collection("comments")
      .deleteOne({ _id: commentId }, true);
    if (response.deletedCount > 0) {
      res.status(201).json({
        'message': 'The comment has been deleted successfully.',
      });
    } else {
        next(createError(400, 'Sorry no comment with entered id.'));
        return;
    }
  } catch (error) { 
    next(createError(500, 'Some error occurred while deleting the comment.'));
    return;
  }
};

module.exports = {
  getAll,
  getSingle,
  createComment,
  updateComment,
  deleteComment,
};
