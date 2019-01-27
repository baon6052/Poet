const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
var path = require("path");


const peopleRoutes = require("./api/routes/people");
const canvasRoutes = require('./api/routes/canvas');
const commentsRoutes = require('./api/routes/comments');

if (process.env.NODE_ENV === "production"){
mongoose.connect("mongodb://baon6052:" + process.env.MONGO_ATLAS_PW + "@poet-shard-00-00-a8tvn.mongodb.net:27017,poet-shard-00-01-a8tvn.mongodb.net:27017,poet-shard-00-02-a8tvn.mongodb.net:27017/test?ssl=true&replicaSet=Poet-shard-0&authSource=admin&retryWrites=true", {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
}

/* app.use(cors({origin: 'http://127.0.0.1:5500'})); */
app.use(cors({origin: 'http://localhost:5500'}));
app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use((req, res, next) => {
    /* res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500"); */
    res.header("Access-Control-Allow-Origin", "http://localhost:5500");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use("/people", peopleRoutes);
app.use("/canvas", canvasRoutes);
app.use('/comments', commentsRoutes);

var Public = path.join(__dirname, "Public");


app.use("/", express.static(Public));


app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;