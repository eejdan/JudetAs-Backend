
const fs = require('fs').promises;

const express = require('express');
const { check } = require('express-validator');
const expressValidation = require('../middleware/expressValidation');

const userTokenProcessing = require('../middleware/userTokenProcessing');

const LocalInstance = require('../models/LocalInstance');
const UserRole = require('../models/AdminRole');
const UserArticle = require('../models/UserArticle');
const UserComment = require('../models/UserComment');
const UserReaction = require('../models/UserReaction');

const multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage, limits: { fileSize: 1000000 /* 1mb */} })

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Yeehaw");
})

//tbd
// will only be a follow up of other requests
router.post('/media-upload', (req, res) => {
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    check('currentAccessToken').not().isEmpty().isAlphanumeric().isLength(64),
    check('buffer_id').not().isEmpty().isAlphanumeric().isLength(64)
    expressValidation,
    userTokenProcessing,
    async (req, res) => {
// ##002 user:{userid}:buffers:{bufferid}:left = leftToUpload count
    }
}) 



router.post('/posts/create',
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    check('currentAccessToken').not().isEmpty().isAlphanumeric().isLength(64),
    check('query_localInstance').not().isEmpty().isString({ max: 64 }),
    check('query_article_problem').not().isEmpty().isString().isLength({ max: 1200 }),
    check('query_article_solution').isString().isLength({ max: 700 }),
    check('query_article_mediaCount').isNumeric(),
    expressValidation,
    userTokenProcessing,
    async (req, res) => {
    if(!res.locals.userid) {
        res.sendStatus(500);
    }
    let instanceId;
    {
        let localInstance = await LocalInstance.findOne({
            displayName: req.body.query_localInstance
        });
        if(!localInstance) {
            return res.sendStatus(400); // 401 pentru mai multa securitate? prin ambiguitate
        }
        instanceId = localInstance._id;
        let urole = await UserRole.findOne({
            user: res.locals.userid,
            localInstance: localInstance._id
        })
        if(!urole) {
            return res.sendStatus(401);
        }
    }// add profanity filter
    let article = new UserArticle({
        user: res.locals.userid,
        localInstance: instanceId,
        progress: 1,
        problemText: req.body.query_article_problem,
        solutionText: req.body.query_article_solution,
        articleMedia: [],
    });


});
router.post('/posts/reaction', 
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    check('currentAccessToken').not().isEmpty().isAlphanumeric().isLength(64),
    check('query_parent').not().isEmpty().isAlphanumeric(),
    check('query_reaction_type').not().isEmpty().isAlphanumeric(),
    check('query_reaction_score').not().isEmpty().isNumeric({ no_symbols: true }).isLength({ max: 3 }),
    async (req, res) => {
    if(!res.locals.userid) {
        res.sendStatus(500);
    }
    let instanceId;
    {
        let parentPost = await UserArticle.findById(req.body.query_parent);
        if(!parentPost) {
            return res.sendStatus(404);
        }
        let localInstance = await LocalInstance.findById(parentPost.localInstance);
        if(!localInstance) {
            return res.sendStatus(500); //removable after tested app integrity
        }
        let urole = await UserRole.findOne({
            localInstance: localInstance._id,
            user: res.locals.userid
        })
        if(!urole) {
            return res.sendStatus(404); // not found within user's authorized instances
        }
        instanceId = localInstance._id;
    }
    let reaction = new UserReaction({
        user: res.locals.userid,
        parent: req.body.query_parent,
    })
    let r = 0;
    switch (req.body.query_reaction_type) {
        case 'rating':
            r = parseInt(req.body.query_reaction_score);
            if(r>0) reaction.rating = 1; else reaction.rating = -1;
            break;
        case 'importance':
            r = parseInt(req.body.query_reaction_score);
            if(r>0) reaction.importance = 1; else reaction.importance = -1;
            break;
        case 'tracked': 
            r = parseInt(req.body.query_reaction_score);
            if(r>0) reaction.tracked = true; else reaction.tracked = false
            break;
        default:
            return res.sendStatus(400);
            break;
    }
    await reaction.save();
    return res.sendStatus(200);
});


router.post('/comments/create',    
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    check('currentAccessToken').not().isEmpty().isAlphanumeric().isLength(64),
    check('query_parent').not().isEmpty().isAlphanumeric(),
    check('query_comment').not().isEmpty().isAlphanumeric().isLength({ max: 450 }),
    expressValidation,
    userTokenProcessing,
    async (req, res) => {
    if(!res.locals.userid) {
        res.sendStatus(500);
    }
    let instanceId;
    let parentId;
    {
        let parentPost = await UserArticle.findById(req.body.query_parent);
        if(!parentPost) {
            return res.sendStatus(404);
        }
        let localInstance = await LocalInstance.findById(parentPost.localInstance);
        if(!localInstance) {
            return res.sendStatus(404); // 401 pentru mai multa securitate? prin ambiguitate
        }
        let urole = await UserRole.findOne({
            localInstance: localInstance._id,
            user: res.locals.userid
        })
        if(!urole) {
            return res.sendStatus(401);
        }
        instanceId = localInstance._id;
        parentId = parentPost._id;
    }  
    let comment = new UserComment({
        user: res.locals.userid,
        parent: parentPost._id,
        ancestor: parentPost._id,
        comment: req.body.query_comment
    })
    await comment.save();
    return res.status(200).send()
})

router.post('/comments/create-reply',
    check('session_id').not().isEmpty().isAlphanumeric().isLength(64),
    check('currentAccessToken').not().isEmpty().isAlphanumeric().isLength(64),
    check('query_parent_comment').not().isEmpty().isAlphanumeric(),
    check('query_comment').not().isEmpty().isAlphanumeric().isLength({ max: 450 }),
    expressValidation,
    userTokenProcessing,
    async (req, res) => {
    if(!res.locals.userid) {
        res.sendStatus(500);
    }
    let instanceId;
    let parentId;
    {
        let parentComment = await UserComment.findById(req.body.query_parent_comment);
        if(!parentComment) {
            return res.sendStatus(404);
        }
        let parentPost = await UserArticle.findById(parentComment.ancestor);
        if(!parentPost) {
            return res.sendStatus(404);
        }
        let localInstance = await LocalInstance.findById(parentPost.localInstance);
        if(!localInstance) {
            return res.sendStatus(500); //removable
        }
        let urole = await UserRole.findOne({
            localInstance: localInstance._id,
            user: res.locals.userid
        })
        if(!urole) {
            return res.sendStatus(404); // not found within user's authorized instances
        }
        instanceId = localInstance._id;
        parentId = parentPost._id;
    }  // tbd profanity filter
    let comment = new UserComment({
        user: res.locals.userid,
        parent: req.body.query_parent_comment,
        ancestor: parentId,
        comment: req.body.query_comment
    })
    await comment.save();
    return res.status(200).send()
})

router.post('/')


module.exports = router;