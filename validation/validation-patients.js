const { body, validationResult } = require('express-validator')
const patientValidationRules = () => {
  return [
    body('name').trim().notEmpty().isLength({ min: 3 }).withMessage({ "message": 'Please provide a full name.' }),
    body('name').matches(/^[A-Za-z\s]+$/).withMessage({ "message": "Numbers and symbols are not allowed." }),

    body('dob').isDate({ format: "MM/DD/YY", delimiters: ['/'] }).withMessage({ "message": 'The date should be entered as follows: MM/DD/YY' }),

    body('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage({ "message": 'Please enter a valid email address.' }),

    body('address.street').trim().notEmpty().isLength({ min: 5 }).withMessage({ "message": 'Please provide a street name.' }),
    body('address.city').trim().notEmpty().isLength({ min: 2 }).withMessage({ "message": 'Please provide a city name.' }),
    body('address.zip').trim().notEmpty().isLength({ min: 5, max: 5 }).withMessage({ "message": 'Please provide a valid 5 digits zip code.' }),
    
    body('phone').trim().notEmpty().matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).withMessage({ "message": 'Phone number must be in the format XXX-XXX-XXXX' }),

    body('insurer').trim().notEmpty().isLength({ min: 2 }).withMessage({ "message": 'Please provide an insurer name.' }),

    body('request').trim().notEmpty().isLength({ min: 15 }).withMessage({"message": 'Please enter a request with at least 15 characters'}),
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
  patientValidationRules,
  validate,
}