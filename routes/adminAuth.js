if (require.main === module) {
    require('dotenv').config();
}

const express = require('express');
const expressValidation = require("../middleware/expressValidation");
const authFindUser = require("../middleware/authFindUser");

const Session = require('../models/UserSession');

const router = express.Router();

router.post('/login',
    body('username').not().isEmpty().isAlphanumeric().isLength({ min: 5, max: 48 }), 
    body('password').not().isEmpty().isString().isLength({ min: 5, max: 48 }),
    expressValidation, 
    authFindUser,
    async (req, res) => {

    }
)
router.post('/authorize',
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("solved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    async (req, res) => {

    }
)