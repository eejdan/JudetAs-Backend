const { validationResult } = require('express-validator')

function expressValidation(req, res, next) {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log('validation failed:'+JSON.stringify(req.body))
        console.log(errors);
        return res.sendStatus(400);
    }
    next();
}

module.exports = expressValidation;