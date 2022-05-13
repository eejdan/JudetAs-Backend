if (require.main === module) {
    require('dotenv').config();
}
const { check } = require("express-validator");
const expressValidation = require('../middleware/expressValidation');

const express = require("express");

const AdminRole = require('../models/AdminRole');
const GeneralAdminRole = require('../models/GeneralAdminRole');
const LocalInstance = require('../models/LocalInstance');

const adminTokenProcessing = require('../middleware/adminTokenProcessing');

const router = express.Router();
const localAdmin = require("./admin/localAdmin");
const generalAdmin = require('./admin/generalAdmin');

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
    }).lean().exec();
    var GARole = await GeneralAdminRole.exists({
        user: res.locals.userid
    });
    if(!adminRoles && !GARole) {
        return res.sendStatus(204)
    }
    if(!adminRoles && !!(GARole)) {
        return res.status(200).send({
            general: true,
            local: []
        })
    }
    let localMap = await Promise.all(adminRoles.map(async ar => {
        let container = {}
        let li = await LocalInstance.findById(ar.localinstance).lean().exec();
        if(li.rank != 0) {
            container.parents = [];
            let currentRank = instance.rank;
            let pressRank = parseInt(instance.rank);
            while(currentRank > 0) {
                let sli = await LocalInstance.findById(instance.parentInstance)
                    .select({ _id: 1, displayName: 1, rank: 1}).lean().exec();
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
        return container;
    }))
    return res.status(200).send({
        general: !!(GARole),
        local: [...localMap]
    });
})

module.exports = router;