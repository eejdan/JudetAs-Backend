// pre authentication si inainte de aprobarea cererii de inregistrare

const generateString = require('../util/generateString');

const express = require('express');

const { check } = require("express-validator");
const expressValidation = require('../middleware/expressValidation');
const userpreSessionProcessing = require('../middleware/userpreSessionProcessing')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+ '\\..\\tempstatic\\')
    }
})
const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 1000000 //1mb
    } 
})

const fs = require('fs').promises;
const crypto = require('crypto');

const User = require('../models/User');
const UserImage = require('../models/UserImage')
const UserRegisterRequest = require('../models/UserRegisterRequest')
const LocalInstance = require('../models/LocalInstance')

const { sendEmailConfirmation } = require('../mailer') 


const client = require('../redisconnection');

const router = express.Router();
//tbd finds localinstance ANCHOR
router.post('/register/address-dynamicqueries', 
    check('query_handle').notEmpty().isAlphanumeric().trim().isLength({ max: 200 }), 
    async (req, res) => {
    var localInstances = await LocalInstance.find({
        $text: { $search: req.body.query_handle }
    }).select({
        displayName: 1, _id: 1, rank: 1, parentInstance: 1
    }).exec();
    if(!localInstances)
        return res.sendStatus(404)
    var instanceMap = await Promise.all(localInstances.map(async instance => {
        let container = {}
        if(instance.rank != 0) {
            container.parents = [];
            let currentRank = instance.rank;
            let pressRank = parseInt(instance.rank);
            while(currentRank > 0) {
                let li = await LocalInstance.findById(instance.parentInstance)
                    .select({ _id: 1, displayName: 1, rank: 1}).exec();
                currentRank = li.rank;
                container.parents[container.parents.length] = li.displayName;
                pressRank--;
                if(pressRank < 0) { // catch the bugged/looped instances
                    break;
                }          
            }
        }
        container.displayName = instance.displayName;
        container.instanceid = instance._id;
        return container;
    }))
    return res.status(200).send({
        instances: instanceMap
    });
})
// cnp will be filled in by administrator ANCHOR
router.post('/register', 
    check('username').notEmpty().isAlphanumeric().isLength({ min: 5, max: 64 }).trim(),
    check('password').not().contains(' ').not().isEmpty().isString().isLength({ min: 5, max: 48 }),
    check('email').notEmpty().isEmail().trim().isLength({ max: 320 }),
    check('firstName').notEmpty().isAlpha().isLength({ max: 64 }).trim(),
    check('lastName').notEmpty().isAlpha().isLength({ max: 64 }).trim(),
    check('address').notEmpty().isAlphanumeric().trim().isLength({ max: 200 }),
    expressValidation, 
    async (req, res) => {
    {
        //tbd test password strength
        let tryUser = await User.exists({ username: req.body.username })
        if(tryUser) {
            return res.sendStatus(410); 
        }
        tryUser = await User.exists({ email: req.body.email })
        if(tryUser) {
            return res.sendStatus(410)
        }
        tryUser = await UserRegisterRequest.exists({ username: req.body.username })
        if(tryUser) {
            return res.sendStatus(410); 
        }        
        tryUser = await UserRegisterRequest.exists({ email: req.body.email })
        if(tryUser) {
            return res.sendStatus(410); 
        }
    }
    let found = true;
    let hashObject = crypto.createHash("sha256");
    let newConfirmString;
    let newRejectString;
    do {
        found = true;
        newConfirmString = generateString(256)
        if( await UserRegisterRequest.exists({
            emailConfirmation: { emailConfirm: newConfirmString }
        })) found = false
    } while(!found)
    do {
        found = true;
        newRejectString = generateString(256)
        if( await UserRegisterRequest.exists({
            emailConfirmation: { emailReject: newRejectString }
        })) found = false
    } while(!found)
    
    let regRequest = new UserRegistrationRequest({
        rejected: false,
        username: req.body.username,
        password: hashObject.update(req.body.password).digest('hex'),
        creationDate: Date.now(),
        email: req.body.email,
        emailConfirmation: {
            isConfirmed: false,
            emailConfirm: newConfirmString,
            emailReject: newRejectString
        },
        claimedMeta: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: address
        }
    })
    await regRequest.save();
    //tbd send email
    sendEmailConfirmation(req.body.email,
        req.body.firstName + req.body.lastName,
        req.body.username, 
        process.env.USER_CONFIRMREJECT_LINK+newConfirmString, 
        process.env.USER_CONFIRMREJECT_LINK+newRejectString
    )
    regRequest.emailConfirmation.lastSent = Date.now()
    await regRequest.save();
    let redisPathString = 'userpre:sessions:';
    let newSessionString;
    do {
        found = true;
        newSessionString = generateString(64);
        let tryStringQuery = await client.exists(
            redisPathString
            +newSessionString
        )
        if(tryStringQuery) {
            found = false;
        }
    }while(!found);
    redisPathString = redisPathString+newSessionString;
    //pre session will expire in 30 days 
    await client.set(redisPathString, true, 'EX', (30 * 24 * 60 * 60));
/*     await client.set(redisPathString+':confirmed', false)  ??????*/ 
    await client.set(redisPathString+':regid', regRequest._id);
    res.cookie("session_id", newSessionString)
    return res.status(200).send({
        "session_id": newSessionString
    })
})

// check if email was confirmed //informational
// ANCHOR
router.get('/register/email-confirmation', //done
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    userpreSessionProcessing,
    async (req, res) => {
    if(!req.body.regid) return res.sendStatus(500);
    var regReq = await UserRegisterRequest.findById(res.locals.regid);
    if(!regReq.emailConfirmation.isConfirmed) {
        return res.sendStatus(204)
    }
    return res.sendStatus(200);
    //left here tbd try confirmation;frontend /userpre/confirm/link variable +reject; test register 
})
router.post('/register/send-email-confirmation', //done ANCHOR
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    userpreSessionProcessing,
    async (req, res) => {
    var regReq = await UserRegisterRequest.findById(res.locals.regid);
    if(!regReq) return res.sendStatus(500);
    if(!regReq.emailConfirmation.lastSent < (Date.now() - (15*60*1000))) {
        return res.sendStatus(429);
    }
    let found = true;
    let newConfirmString;
    let newRejectString;
    do {
        found = true;
        newConfirmString = generateString(256)
        if( await UserRegisterRequest.exists({
            emailConfirmation: { emailConfirm: newConfirmString }
        })) found = false
    } while(!found)
    do {
        found = true;
        newRejectString = generateString(256)
        if( await UserRegisterRequest.exists({
            emailConfirmation: { emailReject: newRejectString }
        })) found = false
    } while(!found)
    regReq.emailConfirmation.emailConfirm = newConfirmString;
    regReq.emailConfirmation.emailReject = newRejectString;
    regReq.emailConfirmation.lastSent = Date.now();
    await regReq.save();
    sendEmailConfirmation(regReq.email,
        regReq.claimedMeta.firstName + regReq.claimedMeta.lastName,
        regReq.username, 
        process.env.USER_CONFIRMREJECT_LINK+newConfirmString, 
        process.env.USER_CONFIRMREJECT_LINK+newRejectString
    )
    return res.sendStatus(200);
})
// will return bufferid pe care o sa se incarce foto buletin / proofofresidence
// frontend will access this after email confirmation ANCHOR
router.post('/register/prepare-media-upload', 
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    userpreSessionProcessing,
    async (req, res) => {
    if(!req.body.regid) return res.sendStatus(500);
    var regReq = await UserRegisterRequest.findById(res.locals.regid);
    if(!regReq.emailConfirmation.isConfirmed) {
        return res.sendStatus(403)
    }
    var user = await User.findOne({
        email: regReq.email
    })

    let redisPathString = `userpre:${user.id}:mediabuffers:`
    let newBufferString;
    var found;
    do {
        found = true;
        newBufferString = generateString(64);
        if( await client.exists(redisPathString+newBufferString )) {
            found = false;
        }
    } while(!found)
    redisPathString = redisPathString+newBufferString
    await client.set(redisPathString, true, 'EX', (12 * 60 * 60))
    await client.set(redisPathString+':scope', 'proofOfResidenceUpload', 'EX', (12 * 60 * 60))
/*     await client.set(redisPathString+':count', '1') */


    return res.status(200).send(newBufferString)
})
router.post('/register/media-upload', //done ANCHOR
    check('buffer_id').notEmpty().isAlphanumeric().isLength(64),
    check('session_id').notEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    upload.single('image'),
    userpreSessionProcessing,
    async (req, res) => {
    if(!req.body.regid) return res.sendStatus(500);
    var regReq = await UserRegisterRequest.findById(res.locals.regid);
    if(!regReq.emailConfirmation.isConfirmed) {
        return res.sendStatus(403)
    }
    var user = await User.findOne({
        email: regReq.email
    })
    if(!user) return res.sendStatus(500);
    {
        let tryBuffer = await client.exists('userpre:'
            +user._id+':mediabuffers:'+req.body.buffer_id);
        if(!tryBuffer) {
            return res.sendStatus(403)
        }
    }
    {
        let tryBufferScope = await client.get('userpre:'
        +user._id+':mediabuffers:'+req.body.buffer_id+':scope');
        if(tryBufferScope != 'proofOfResidenceUpload') {
            return res.sendStatus(403)
        }
    }
    var proofOfResidence = new UserImage({
        img: {
            data: await fs.readFile(req.file.path),
            contentType: req.file.mimetype
        }
    });
    await proofOfResidence.save();
    regReq.proofOfResidence = proofOfResidence._id;
    regReq.reviewStatus = 1;
    await regReq.save();
    return res.sendStatus(200);
})
router.get('/register/reviewable',  // ANCHOR
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    userpreSessionProcessing,
    async (req, res) => {
    if(!req.body.regid) return res.sendStatus(500);
    var regReq = await UserRegisterRequest.findById(res.locals.regid);
    if(!regReq) {
        return res.sendStatus(500)
    }
    if(regReq.reviewStatus != 1) {
        return res.sendStatus(304)
    }
    return res.sendStatus(200);
})
router.post('/register/confirm-reject/:crid', //done ANCHOR
    async (req, res) => {
    let status = '404';
    let regReq = await UserRegisterRequest.findOne({
        emailConfirmation: {
            emailConfirm: req.params.crid,
        }
    })
    if(!regReq) {
        regReq = await UserRegisterRequest.findOne({
            emailConfirmation: {
                emailReject: req.params.crid,
            }
        })
        if(!regReq) {
            return res.sendStatus(404);
        } else {
            status = 'reject'
        }
    } else status = 'confirm'
    switch(status) {
        case 'confirm':
            regReq.emailConfirmation.isConfirmed = true;
            regReq.emailConfirmation.emailConfirm = '';
            regReq.emailConfirmation.emailReject = '';
            await regReq.save();
            return res.sendStatus(200)
            break;
        case 'reject':
            await UserRegisterRequest.findByIdAndDelete(regReq._id);
            return res.sendStatus(200)
            break;
        default:
            return res.sendStatus(404);
    }
})
// create confirm/reject pages


module.exports = router