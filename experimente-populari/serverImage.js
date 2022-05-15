if (require.main === module) {
    require('dotenv').config();
}

const fs = require('fs').promises;
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
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+ '\\..\\tempstatic\\')
    }
})
const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 1000000 //1mb
    } 
})


const UserImage = require('../models/UserImage')

const express = require('express');

const app = express();
const cors = require('cors');


app.get('/', cors(), (req, res) => {
    res.sendFile(__dirname +'/index.html');
})

app.post('/image', 
    upload.single('image'), 
    async (req, res) => {
    console.log(req.file);
    res.sendStatus(200);
    var image = new UserImage({
        img: {
            data: await fs.readFile(req.file.path),
            contentType: req.file.mimetype
        }
    });
    await image.save();
    console.log(image._id);
})
app.get('/img/:imgid', async (req, res) => {
    console.log("a");
    var image = await UserImage.findById(req.params.imgid);
    if(!image) {
        console.log("test");
    }
    return res.status(200).send(
        `<img src="data:${image.img.contentType};base64, ${image.img.data.toString('base64')}">`);

})
app.listen(303)