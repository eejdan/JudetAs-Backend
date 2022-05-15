if (require.main === module) {
    require('dotenv').config();
}

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://'
+process.env.BACKEND_MONGO_USERNAME
+':'+process.env.BACKEND_MONGO_PASSWORD
+'@'+process.env.BACKEND_MONGO_URL, {
    dbName: 'JudetAs',
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);

const UserRole = require('../models/UserRole');
const User = require('../models/User');
const GeneralAdminRole = require('../models/GeneralAdminRole');

setTimeout(async () => {
    let ga = await GeneralAdminRole.findOne({ user: mongoose.Types.ObjectId('1aa11aaa1aab')}).exec();
    if(!ga) { console.log('not ga') } else { console.log('ga') }

}, 1000)