if (require.main === module) {
    require('dotenv').config();
}
const { check } = require("express-validator");
const expressValidation = require('../middleware/expressValidation');

const express = require("express");

const User = require('../models/User');
const AdminRole = require('../models/AdminRole');
const GeneralAdminRole = require('../models/GeneralAdminRole');
const LocalInstance = require('../models/LocalInstance');

const adminTokenProcessing = require('../middleware/adminTokenProcessing');

const router = express.Router();


const GACheck = async (req, res, next) => {
    let GARole = await GeneralAdminRole.exists({ user: res.locals.userid });
    if(!GARole) {
        return res.sendStatus(401);
    }
    return next();
}

//folosit pentru confirmarea existentei utilizatorului in casuta de cautare din panoul de administrare generala
router.get("/dynamicqueries",
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_type").not().isEmpty().isString({ max: 32 }),
    check("query_handle").not().isEmpty().isString({ max: 48 }), 
    expressValidation,
    adminTokenProcessing,
    GACheck,
    async (req, res) => {
    if(!res.locals.currentAccessToken) {
        return res.sendStatus(500);
    }
    var user;
    switch (req.body.query_type) {
        case 'username':
            user = await User.findOne({ username: req.body.query_handle }).select({ _id: 1 }).exec();
            break;
        case 'CNP': 
            user = await User.findOne({ meta: { CNP: req.body.query_handle }}).select({ _id: 1 }).exec();
            break;
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
router.get("/single",
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_type").not().isEmpty().isString({ max: 32 }),
    check("query_handle").not().isEmpty().isString({ max: 48 }),
    expressValidation,
    adminTokenProcessing,
    GACheck,
    async (req, res) => {
    var user;
    switch (req.body.query_type) {
        case 'username':
            user = await User.findOne({ username: req.body.query_handle })
            break;
        case 'CNP': 
            user = await User.findOne({ meta: { CNP: req.body.query_handle }})
            break;
        default:
            return res.sendStatus(400);
            break;
    }
    await user.select({ 
        _id: 1,
        registrationDate: 1,
        username: 1,
        meta: {
            firstName: 1,
            lastName: 1,
            CNP: 1
        }
    }).exec();
    if(!user) {
        return res.sendStatus(404);
    }
    let container = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        CNP: user.CNP, // de implementat ##002 
        registrationDate: user.registrationDate,
        
    }
    return res.status(200).send({
        user: container
    })

})

//atribuie un rol de adminstrare unui user
router.post("/addrole",
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_user_handle").not().isEmpty().isString({ max: 32 }), //user username
    check("query_localInstance").not().isEmpty().isString({ max: 64 }),  //localinstance displayName
    expressValidation,
    adminTokenProcessing,
    GACheck,
    async (req, res) => {
    var queryUser = await User.findOne({ username: req.body[query_user_handle] }).exec();
    if(!queryUser) {
        return res.sendStatus(400);
    }
    var localInstance = await LocalInstance.findOne({ displayName: req.body[query_localInstance] }).exec();
    if(!localInstance) {
        return res.sendStatus(400);
    }
    try {
        let adminRole = new AdminRole({ 
            localInstance: localInstance._id,
            user: queryUser._id
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
router.get("/request-list", 
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation, 
    adminTokenProcessing, 
    GACheck,
    async (req, res) => {
    var adminRequests = AdminRequest.find({}).exec();
    let requests = await Promise.all(adminRequests.map(async item => {
        let container;
        let iteratedUser = 
            await User.findById(item.user)
                        .select({
                            username: 1,
                            registrationDate: 1,
                            meta: {
                                firstName: 1,
                                lastName: 1,
                                CNP: 1
                            }
                        })
                        .exec();
        container.username = iteratedUser.username;
        container.registrationDate = iteratedUser.registrationDate;
        container.firstName = iteratedUser.meta.firstName;
        container.lastName = iteratedUser.meta.lastName;
        container.CNP = iteratedUser.meta.CNP;        
        return container;
    }))
    return res.status(200).send({ requests: requests });
})

module.exports = router;