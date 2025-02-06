const { body, validationResult } = require('express-validator')
const commentValidationRules = () => {
  return [
    body('name').trim().notEmpty().isLength({ min: 3 }).withMessage({ "message": 'Please provide a full name.' }),
    body('name').matches(/^[A-Za-z\s]+$/).withMessage({ "message": "Numbers and symbols are not allowed." }),

    body('username').trim().notEmpty().isLength({ min: 5 }).withMessage({ "message": 'Please enter a valid username with at least 5 characters.' }),

    body('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage({ "message": 'Please enter a valid email address.' }),

    body('comment').trim().notEmpty().isLength({ min: 15 }).withMessage({"message": 'Please enter a comment with at least 15 characters'}),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => {
    if (err.msg.message) { 
      extractedErrors.push({'message' : err.msg.message })
    }
  })

  return res.status(400).json({
    error: extractedErrors,
  })
}

module.exports = {
  commentValidationRules,
  validate,
}