
require('dotenv').config();

const express = require("express");
const helmet = require("helmet");

const app = express();
const auth = require("./routes/auth");
const admin = require("./routes/admin")

app.use(helmet());
app.use(express.json());
app.use((req, res, next) =>{
    console.log(req.path)
    next();
})
app.use('/api/auth', auth);
app.use('/api/admin', admin);

app.get('/api/', (req, res) => {
    res.send("test");
})



app.listen(process.env.BACKEND_PORT)

/* 
TODO
handle mongo ECONNREFUSED
each user session will have only one valid access token
*/