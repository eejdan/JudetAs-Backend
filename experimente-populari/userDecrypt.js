if (require.main === module) {
    require('dotenv').config();
}

const mongoose = require("mongoose");

mongoose.connect(
    'mongodb+srv://'
    +process.env.BACKEND_MONGO_USERNAME
    +':'+process.env.BACKEND_MONGO_PASSWORD
    +'@'+process.env.BACKEND_MONGO_URL, {
        dbName: 'JudetAs',
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
async function init() {
    const User = require("../schemas/user");
    const { decrypt } = require("../util/encryption");

    let ax = await User.findOne({})

    console.log(decrypt(ax.pin))
}
init();