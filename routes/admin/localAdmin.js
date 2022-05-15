
const express = require('express');
const { check } = require('express-validator');
const expressValidation = require('../../middleware/expressValidation');

const AdminRole = require('../../models/AdminRole')
const UserRegisterRequest = require('../../models/UserRegisterRequest')
const UserImage = require('../../models/UserImage');
const LocalInstance = require('../../models/LocalInstance');

const adminTokenProcessing = require('../../middleware/adminTokenProcessing');
const User = require('../../models/User');

const router = express.Router();

router.get('/', (req, res) => { //ANCHOR
    res.send("Yeehaw");
})

router.get('/uid', (req, res) => {
    res.sendStatus(502)
})
router.get('/upid', (req, res) => {
    res.sendStatus(502)
})

router.post('/instance', 
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    adminTokenProcessing,
    async (req, res) => { res.sendStatus(502); }) //tbd get info for instance popup; TODO


router.get('/dynamicqueries', //ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_handle").isString(),
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {
    if(!res.locals.userid) {
        return res.sendStatus(500);
    }
    {
        let adminRole = await AdminRole.exists({
            localInstance: req.body.query_handle,
            user: res.locals.userid
        }).exec();
        if(!adminRole) { 
            return res.sendStatus(403);
        }
    }
    var localInstance = await LocalInstance.findById(req.body.query_handle).exec();
    
})


router.get('/requestlist', //done ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_handle").not().isEmpty().isAlphanumeric(),
    expressValidation,
    adminTokenProcessing, 
    async (req, res) => {
    if(!res.locals.currentAccessToken) {
        return res.sendStatus(500);
    }
    {
        let adminRole = await AdminRole.exists({
            localInstance: req.body.query_handle,
            user: res.locals.userid
        }).exec();
        if(!adminRole) return res.sendStatus(403);
    }
    var userRegisterRequests = await UserRegisterRequest.find({
        reviewStatus: 1,
        localInstance: req.body.query_handle
    }).select({
        _id: 1,
        username: 1,
        creationDate: 1,
        email: 1,
        claimedMeta: {
            firstName: 1,
            lastName: 1,
            localInstance: 1
        },
        proofOfResidence: 1
    }).exec();
    return res.status(200).send({
        requests: userRegisterRequests
    });
}) //left here
router.get('/proofOfResidence', //ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_handle").not().isEmpty().isAlphanumeric(), //registerRequest id
    check("query_localInstance").notEmpty().isAlphanumeric(), // id 
    expressValidation,
    adminTokenProcessing, 
    async (req, res) => {
    if(!res.locals.currentAccessToken) return res.sendStatus(500);
    {
        let adminRole = await AdminRole.exists({
            localInstance: req.body.query_localInstance,
            user: res.locals.userid
        }).exec();
        if(!adminRole) return res.sendStatus(403);
    }
    var regReq = await UserRegisterRequest.findOne({
        _id: req.body.query_handle,
        claimedMeta: {
            localInstance: req.body.query_localInstance
        }
    }).select({
        _id: 1,
        reviewStatus: 1,
        proofOfResidence: 1
    }).exec();
    if(!regReq.reviewStatus != 1) return res.sendStatus(410);
    var proofOfResidence = UserImage.findById(regReq.proofOfResidence);
    if(!proofOfResidence) return res.sendStatus(500);
    //tbd sanitize? 
    return res.status(200).send({
        image: proofOfResidence.img
    })
})


router.get('/userpreinfo', //ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_handle").isString({ max: 48 }), //registerRequest id
    check("query_localInstance").notEmpty().isAlphanumeric(), // id 
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {
    if(!res.locals.currentAccessToken) return res.sendStatus(500);
    {
        let adminRole = await AdminRole.exists({
            localInstance: req.body.query_localInstance,
            user: res.locals.userid
        }).exec();
        if(!adminRole) return res.sendStatus(403);
    }
    let regReq = await UserRegisterRequest.findById(req.body.query_handle)
    .select({
        _id: 1,
        reviewStatus: 1,
        creationDate: 1,
        username: 1,
        email: 1,
        password: 1,
        pin: 1,
        claimedMeta: {
            firstName: 1,
            lastName: 1,
            localInstance: 1
        },
        proofOfResidence: 1,
        changesNecesary: {
            text: 1,
            object: 1
        }
    }).exec();
    regReq.password = '';
    regReq.pin = '';
    if(!regReq) return res.sendStatus(404);
    return res.status(200).send({
        info: regReq
    });
})

router.get('/userinfo', //ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_handle").isString({ max: 48 }), //id
    check("query_localInstance").notEmpty().isAlphanumeric(), // id 
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {
    if(!res.locals.currentAccessToken) return res.sendStatus(500);
    {
        let adminRole = await AdminRole.exists({
            localInstance: req.body.query_localInstance,
            user: res.locals.userid
        }).exec();
        if(!adminRole) return res.sendStatus(403);
    }
    let user = await User.findById(req.body.query_handle).select("-password -pin").exec();
    if(!user) return res.sendStatus(404);
    let container = {
        username: user.username,
        email: user.email,
        registrationDate: user.registrationDate,
        firstName: user.meta.firstName,
        lastName: user.meta.lastName,
        CNP: user.meta.CNP
    };
    return res.status(200).send({
        info: container
    })
})

router.post('/createmod',//ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_user_handle").isString({ max: 48 }), //username
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {

})

router.get('/articlelist', //ANCHOR
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    check("query_localInstance").isString({ max: 72 }), // displayName
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {
        
    }
)



//tbd dynamicqueries -> is user asigned to local instance (search box)
//tbd userinfo get -> get user information (if assigned)
//tbd createmod post -> make user moderator
//tbd get all posts + children localInstance posts 
//tbg get is request still valid
// get request image will use session id only


module.exports = router;