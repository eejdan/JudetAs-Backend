
require('dotenv').config();

const express = require("express");
const helmet = require("helmet");

const app = express();
const auth = require("./routes/auth");

app.use(helmet());
app.use(express.json());

app.use('/auth', auth);

app.get('/', (req, res) => {
    res.send("test");
})



app.listen(process.env.BACKEND_PORT)

