
require('dotenv').config();

const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser")

const { join } = require('path')

const mongoose = require("mongoose");
const crypto = require("crypto")

main().catch(err => console.log(err));

async function main() {
    mongoose.connect('mongodb+srv://'
        +process.env.BACKEND_MONGO_USERNAME
        +':'+process.env.BACKEND_MONGO_PASSWORD
        +'@'+process.env.BACKEND_MONGO_URL, {
            dbName: 'JudetAs',
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
}

const app = express();
const auth = require("./routes/auth");
const admin = require("./routes/admin");
const user = require("./routes/user")
const userpre = require("./routes/userpre")

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(join(__dirname, 'static')));
app.use((req, res, next) =>{
    console.log(req.path)
    next();
})
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/user', user);
app.use('/api/userpre', userpre);
app.get('/api/', (req, res) => {
    res.send("test");
})

//localinstance display names will have max 64 chars
//usernames will have max 48 chars
app.listen(process.env.BACKEND_PORT)
