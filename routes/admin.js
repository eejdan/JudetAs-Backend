if (require.main === module) {
    require('dotenv').config();
}
const { check } = require("express-validator");
const expressValidation = require('../middleware/expressValidation');

const express = require("express");

const mongoose = require('mongoose');
const AdminRole = require('../models/AdminRole');
const GeneralAdminRole = require('../models/GeneralAdminRole');
const LocalInstance = require('../models/LocalInstance');

const adminTokenProcessing = require('../middleware/adminTokenProcessing');

const router = express.Router();
const localAdmin = require("./admin/localAdmin");
const generalAdmin = require('./admin/generalAdmin');
const User = require('../models/User');

router.use("/generalAdmin", generalAdmin)
router.use("/localAdmin", localAdmin)

router.post("/create-pin", (req, res) => res.sendStatus(501)); //tbd ##006

router.post('/roles', 
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {
    if(!res.locals.currentAccessToken) return res.sendStatus(500);
    var adminRoles = await AdminRole.find({
        user: res.locals.userid
    }).select({
        _id: 1,
        localInstance: 1,
        user: 1
    }).exec();
    var GARole = await GeneralAdminRole.exists({
        user: res.locals.userid
    }).exec();
    if(!adminRoles && !GARole) {
        return res.sendStatus(204)
    }
    if(!adminRoles && !!(GARole)) {
        return res.status(200).send({
            general: true,
            local: []
        })
    }
    let localMap = [];
    for (let i in adminRoles) {
        let container = {}
        let ar = adminRoles[i];
        console.log(ar);
        let li = await LocalInstance.findById(ar.localInstance).exec();
        
        if(!!(li.rank) && li.rank != 0) {
            container.parents = [];
            let currentRank = instance.rank;
            let pressRank = parseInt(instance.rank);
            while(currentRank > 0) {
                let sli = await LocalInstance.findById(instance.parentInstance)
                    .select({ _id: 1, displayName: 1, rank: 1}).exec();
                currentRank = sli.rank;
                container.parents[container.parents.length] = sli.displayName;
                pressRank--;
                if(pressRank < 0) { // catch the bugged/looped instances
                    break;
                }          
            }
        }
        container.displayName = li.displayName;
        container.instanceid = li._id;
        localMap.push(container);
    }
    return res.status(200).send({
        general: !!(GARole),
        local: [...localMap]
    });
})

router.post('/getaccount/',
    check("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    check("currentAccessToken").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    adminTokenProcessing,
    async (req, res) => {
    if(!res.locals.currentAccessToken) return res.sendStatus(500);

    var user = await User.findById(res.locals.userid).select({
        username: 1,
        email: 1,
        password: 1,
        pin: 1,
        registrationDate: 1,
        meta: {
            firstName: 1,
            lastName: 1,
            CNP: 1
        } 
    }).exec();
    if(!user) {
        return res.sendStatus(410);
    }
    var account = {};
    account.fullName = user.meta.lastName + ' ' + user.meta.firstName;
    account.username = user.username;
    account.email = user.email;
    account.registrationDate = user.registrationDate
    if(user.CNP && user.CNP.length > 1) {
        account.CNP = user.meta.CNP
    }
    account.access = {}
    {
        let GARole = await GeneralAdminRole.exists({
            user: res.locals.userid
        }).exec();
        if(!!(GARole)) {
            account.access.general = true;
        } else account.access.general = false;
    }
    {
        let adminRoles = await AdminRole.find({
            user: res.locals.userid
        }).select({
            _id: 1,
            localInstance: 1,
            user: 1
        }).exec();
        account.access.local = [];
        if(adminRoles && adminRoles.length > 0) {
            for(let i in adminRoles) {
                let role = adminRoles[i];
                let li = await LocalInstance.findById(role.localInstance)
                                .select({ displayName: 1, parentInstance: 1}).exec();
                let container = {
                    displayName: li.displayName,
                    id: li._id
                }
                if(li.parentInstance) {
                    let pi = await LocalInstance.findById(li.parentInstance).exec();
                    if(pi) { 
                        container.parentName = pi.displayName
                        container.parentId = pi._id;
                    }
                }
                account.access.local.push(container)
            }
        }
    }
    return res.status(200).send({
        account: account
    })
})

module.exports = router;