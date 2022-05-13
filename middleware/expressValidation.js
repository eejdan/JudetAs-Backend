    const { validationResult } = require('express-validator')

function expressValidation(req, res, next) {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log('validation failed:');
        console.log(req.body)
        console.log(errors); //debugging
        return res.sendStatus(400);
    }
    next();
}

module.exports = expressValidation;