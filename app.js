// https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
const dotenv = require("dotenv");
dotenv.config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

// mongoose model for Image
var imgModel = require('./model');

const fs = require('fs');
const path = require('path');
console.log(typeof process.env.DB_URL);
console.log(process.env.DB_URL);

// establish connection to mongoDB
mongoose.connect(process.env.DB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });

// create image schema
const memesSchema = new mongoose.Schema({
    name: String,
    desc: String,
    author: String,
    img:
    {
        // the data type for the image is a Buffer 
        // which allows us to store our image as data 
        // in the form of arrays.
        data: Buffer,
        contentType: String
    }
});

// create mongoose model for the meme based on memesSchema
// automatically creates memes collections
module.exports = new mongoose.model("Meme", memesSchema);

// set up EJS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(bodyParser.json());
  
// Set EJS as templating engine 
app.set("view engine", "ejs");

// set up multer for storing uploaded files
const multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
var upload = multer({ storage: storage });

// the GET request handler that provides the HTML UI
app.get('/', (req, res) => {
    mongoose.model('Meme').find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('timeline', { items: items });
        }
    });
});

// the POST handler for processing the uploaded file
app.post('/', upload.single('image'), (req, res, next) => {
    if(req.file === undefined || req.file === 0 || req.file === ""){
        res.redirect("/");
    }
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        author: req.body.author,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    mongoose.model('Meme').create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
});

// render the uploadPage 
app.get('/upload', (req, res) => {
    // mongoose.model('Meme').find({}, (err, items) => {
    //     if (err) {
    //         console.log(err);
    //         res.status(500).send('An error occurred', err);
    //     }
    //     else {
    //         res.render('timeline', { items: items });
    //     }
    // });
    res.render('uploadPage');
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 6000;
}


app.listen(port, err => {
    if (err) {
        throw err
    } else {
        console.log('server has started successfully');
    }
    
})