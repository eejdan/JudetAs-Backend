
require('dotenv').config();

const express = require("express");
const helmet = require("helmet");

const app = express();

app.use(helmet());

app.get('/', (req, res) => {
    res.send("test");
})

app.listen(3030)