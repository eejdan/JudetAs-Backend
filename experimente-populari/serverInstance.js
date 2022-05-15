if(require.main === module) {
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

const LocalInstance = require('../models/LocalInstance');

async function init() {
    let instances = await LocalInstance.find({}).select({ _id: 1, displayName: 1}).lean().exec();
    console.log(instances);
}
init();