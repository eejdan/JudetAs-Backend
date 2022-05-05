if (require.main === module) {
    require('dotenv').config();
}
const { body } = require("express-validator");
const expressValidation = require('../middleware/expressValidation');

const express = require("express");
const localInstance = require('../schemas/localInstance');
const User = require('../models/User');
const adminTokenProcessing = require('../middleware/adminTokenProcessing');
const router = express.Router();

//router.use()

router.get("/administrator-general/",
    
    adminTokenProcessing,
    (req, res) => {
        if(!res.locals.newTokenString) {
            res.sendStatus(500);
        }
    
})

router.get("/user-req", (req, res) => {
    let userQuery = User.find({});
    userQuery.exec((err, docs) => {
        let newDocs = docs.map(person => {
            let container = {}
            container.firstName = person.firstName
            container.lastName = person.lastName
            container.registrationDate = person.registrationDate
            container.CNP = person.meta.CNP
            return container;
        })
        res.send(newDocs);
        console.log("sent");
    })
})

router.get("/general",
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    (req, res, next) => {
        
    },(req, res) => {
    let instanceQuery = localInstance.find({})
})

module.exports = router;