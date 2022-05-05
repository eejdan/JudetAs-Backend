
const crypto = require("crypto");
const User = require("../models/User");

const authFindUser = async (req, res, next) => {
    let HashObject = crypto.createHash("sha256");
    let user = await User.findOne({
        username: req.body.username,
        password: hashObject.update(req.body.password).digest('hex')
    }).exec();
    if(!user) {
        return res.sendStatus(401);
    }
    res.locals.user = user;
    return next();
}

module.exports = authFindUser;