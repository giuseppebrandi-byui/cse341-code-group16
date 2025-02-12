const { body, validationResult } = require('express-validator')
const practitionerValidationRules = () => {
  return [
    body('name').trim().notEmpty().isLength({ min: 3 }).withMessage({ "message": 'Please provide a full name.' }),
    body('name').matches(/^[A-Za-z\s]+$/).withMessage({ "message": "Numbers and symbols are not allowed." }),

    body('specialization').trim().notEmpty().isLength({ min: 3 }).withMessage({ "message": 'Please enter your specialization.' }),
    body('specialization').matches(/^[A-Za-z\s]+$/).withMessage({ "message": "Numbers and symbols are not allowed." }),

    body('dea_number').trim().notEmpty().matches(/^\S{2}\d{7}$/).withMessage({ "message": 'Please enter your Dea Number - e.g. CP2756344' }),

    body('address.street').trim().notEmpty().isLength({ min: 5 }).withMessage({ "message": 'Please provide a street name.' }),
    body('address.city').trim().notEmpty().isLength({ min: 2 }).withMessage({ "message": 'Please provide a city name.' }),
    body('address.zip').trim().notEmpty().isLength({ min: 5, max: 5 }).withMessage({ "message": 'Please provide a valid 5 digits zip code.' }),
    
    body('phone').trim().notEmpty().matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).withMessage({ "message": 'Phone number must be in the format XXX-XXX-XXXX' }),

    body('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage({ "message": 'Please enter a valid email address.' })
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
  practitionerValidationRules,
  validate,
}

