if (require.main === module) {
    require('dotenv').config();
}
const { body } = require("express-validator");
const expressValidation = require('../middleware/expressValidation');

const express = require("express");

const mongoose = require('mongoose')
const User = require('../models/User');
const AdminRole = require('../models/AdminRole');
const GeneralAdminRole = require('../models/GeneralAdminRole');
const LocalInstance = require('../models/LocalInstance');

const adminTokenProcessing = require('../middleware/adminTokenProcessing');

const router = express.Router();

//router.use()

// ##003


//folosit pentru confirmarea existentei utilizatorului in casuta de cautare din panoul de administrare generala
router.get("/administrator-general/dynamicqueries",
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_type").isString({ max: 32 }),
    body("query_handle").isString({ max: 46 }),
    expressValidation,
    adminTokenProcessing,
    (req, res) => {
    if(!res.locals.currentAccessToken) {
        return res.sendStatus(500);
    }
    {
        let GARole = await GeneralAdminRole.exists({ user: res.locals.userid });
        if(!GARole) {
            return res.sendStatus(401);
        }
    }
    var user;
    switch (req.body.query_type) {
        case 'username':
            user = await User.findOne({ username: req.body.query_handle }).select({ _id: 1 }).exec();
            break;
        case 'CNP': 
            user = await User.findOne({ meta: { CNP: req.body.query_handle }}).select({ _id: 1 }).exec();
            break;
        case 'phonenumber': 
            return res.sendStatus(501) // de implementat ##001
        default:
            return res.sendStatus(400);
            break;
    }
    if(!user) {
        return res.sendStatus(404); //userul nu a fost gasit
    } else {
        return res.sendStatus(200); //userul a fost gasit    
    }
})
//pentru gasirea unui utilizator in scopul de a-i atribui mai tarziu un rol de administrare
router.get("/administrator-general/single",
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_type").isString({ max: 32 }),
    body("query_handle").isString({ max: 46 }),
    expressValidation,
    adminTokenProcessing,
    (req, res) => {
    {
        let GARole = await GeneralAdminRole.exists({ user: res.locals.userid });
        if(!GARole) {
            return res.sendStatus(401);
        }
    }
    var user;
    switch (req.body.query_type) {
        case 'username':
            user = await User.findOne({ username: req.body.query_handle })
                            .select({ 
                                _id: 1,
                                registrationDate: 1,
                                username: 1,
                                meta: {
                                    firstName: 1,
                                    lastName: 1,
                                    phoneNumber: 1,
                                    CNP: 1
                                }
                            })
                            .exec();
            break;
        case 'CNP': 
            user = await User.findOne({ meta: { CNP: req.body.query_handle }})
                            .select({ 
                                _id: 1,
                                registrationDate: 1,
                                username: 1,
                                meta: {
                                    firstName: 1,
                                    lastName: 1,
                                    phoneNumber: 1,
                                    CNP: 1
                                }
                            })
                            .exec();
            break;
        case 'phonenumber': 
            return res.sendStatus(501) // de implementat ##001
        default:
            return res.sendStatus(400);
            break;
    }
    if(!user) {
        return res.sendStatus(404);
    }
    let container = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        CNP: user.CNP, // de implementat ##002 
        phoneNumber: user.phoneNumber,
        registrationDate: user.registrationDate
    }
    return res.status(200).send({
        user: container
    })

})

//atribuie un rol de adminstrare unui user
router.post("/administrator-general/single",
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_user_handle").isString({ max: 32 }), //user username
    body("query_localInstance_handle").isString(),  //localinstance displayName
    expressValidation,
    adminTokenProcessing,
    (req, res) => {
    {
        let GARole = await GeneralAdminRole.exists({ user: res.locals.userid });
        if(!GARole) {
            return res.sendStatus(401);
        }
    }
    var queryUser = await User.findOne({ username: req.body[query_user_handle] }).exec();
    if(!queryUser) {
        return res.sendStatus(400);
    }
    var localInstance = await LocalInstance.findOne({ displayName: req.body[query_localInstance_handle] }).exec();
    if(!localInstance) {
        return res.sendStatus(400);
    }
    try {
        let adminRole = new AdminRole({ 
            localInstance: mongoose.Types.ObjectId(localInstance._id),
            user: mongoose.Types.ObjectId(queryUser._id)
        })
        await adminRole.save();
        return res.sendStatus(200);
    } catch(e) {
        console.log(e);
        console.log('returning 400');
        return res.sendStatus(400);
    }
})

//lista de cereri de administrare 
router.get("/administrator-general/list", 
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation, 
    adminTokenProcessing, 
    (req, res) => {
    {
        let GARole = await GeneralAdminRole.exists({ user: res.locals.userid });
        if(!GARole) {
            return res.sendStatus(401);
        }
    }
    var adminRequests = AdminRequest.find({}).exec();
    let requests = adminRequests.map(item => {
        let container;
        let iteratedUser = 
            await User.findById(item.user)
                        .select({
                            username: 1,
                            registrationDate: 1,
                            meta: {
                                firstName: 1,
                                lastName: 1,
                                CNP: 1,
                                phoneNumber: 1
                            }
                        })
                        .exec();
        container.username = iteratedUser.username;
        container.registrationDate = iteratedUser.registrationDate;
        container.firstName = iteratedUser.meta.firstName;
        container.lastName = iteratedUser.meta.lastName;
        container.CNP = iteratedUser.meta.CNP;
        container.phoneNumber = iteratedUser.meta.phoneNumber;
        
        return container;
    })
    return res.status(200).send({ requests: requests }); //left here
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

module.exports = router;