
const express = require('express');
const expressValidation = require('../../middleware/expressValidation');

const AdminRole = require('../../models/AdminRole')
const UserRegisterRequest = require('../../models/UserRegisterRequest')
const UserImage = require('../../models/UserImage');


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
router.get('/dynamicqueries', //ANCHOR
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_type").isString({ max: 32 }),
    body("query_handle").isString(),
    expressValidation,
    adminTokenProcessing,
    (req, res) => {

})


router.get('/requestlist', //done ANCHOR
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_handle").not().isEmpty().isAlphanumeric(),
    expressValidation,
    adminTokenProcessing, 
    (req, res) => {
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
            localInstance: 0
        },
        proofOfResidence: 1
    }).lean().exec();
    return res.status(200).send({
        requests: userRegisterRequests
    });
}) //left here
router.get('/proofOfResidence', //ANCHOR
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_handle").not().isEmpty().isAlphanumeric(), //registerRequest id
    body("query_localInstance").notEmpty().isAlphanumeric(), // id 
    expressValidation,
    adminTokenProcessing, 
    (req, res) => {
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
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_handle").isString({ max: 48 }), //registerRequest id
    body("query_localInstance").notEmpty().isAlphanumeric(), // id 
    expressValidation,
    adminTokenProcessing,
    (req, res) => {
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
        password: 0,
        claimedMeta: {
            firstName: 1,
            lastName: 1,
            localInstance: 0
        },
        proofOfResidence: 1,
        changesNecesary: {
            text: 1,
            object: 1
        }
    }).lean().exec();
    if(!regReq) return res.sendStatus(404);
    return res.status(200).send({
        info: regReq
    });
})

router.get('/userinfo', //ANCHOR
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_handle").isString({ max: 48 }), //id
    body("query_localInstance").notEmpty().isAlphanumeric(), // id 
    expressValidation,
    adminTokenProcessing,
    (req, res) => {
    if(!res.locals.currentAccessToken) return res.sendStatus(500);
    {
        let adminRole = await AdminRole.exists({
            localInstance: req.body.query_localInstance,
            user: res.locals.userid
        }).exec();
        if(!adminRole) return res.sendStatus(403);
    }
    let user = await User.findById(req.body.query_handle).select("-password -pin").lean().exec();
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
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_user_handle").isString({ max: 48 }), //username
    expressValidation,
    adminTokenProcessing,
    (req, res) => {

})

router.get('/articlelist', //ANCHOR
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    body("query_localInstance").isString({ max: 72 }), // displayName
    expressValidation,
    adminTokenProcessing,
    (req, res) => {
        
    }
)



//tbd dynamicqueries -> is user asigned to local instance (search box)
//tbd userinfo get -> get user information (if assigned)
//tbd createmod post -> make user moderator
//tbd get all posts + children localInstance posts 
//tbg get is request still valid
// get request image will use session id only


module.exports = router;