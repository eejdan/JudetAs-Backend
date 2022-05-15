
require('dotenv').config();

const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser")

const mongoose = require("mongoose");

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

app.use((req, res, next) =>{
    console.log('\n ------- NEW')
    req.body = {
        ...req.body,
        ...req.params
    }
    console.log(req.method + ' ' + req.path);
    console.log(req.body);
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "*");
    res.set("Access-Control-Expose-Headers", "*"); //tbd allowed origins TODO
    next();
})
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/user', user);
app.use('/api/userpre', userpre);
app.get('/api/', (req, res) => {
    res.send("test");
})
app.get('/', (req, res) => {
  res.send('Yes');
})

//localinstance display names will have max 64 chars
//usernames will have max 48 chars
app.listen(8080, () => {
    console.log("Backend server started")
})
setTimeout(()=> {
    console.log("Alive after 5 seconds")
}, 5000)
