// read: 
// Querying/reading data from database: https://mongoosejs.com/docs/models.html#querying
// deleting data from database: https://mongoosejs.com/docs/models.html#deleting
// updating data in database: https://mongoosejs.com/docs/models.html#updating


var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var bcrypt = require("bcrypt-inzi")
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken
var mongoose = require("mongoose");
var server = express();

server.use(morgan("dev"));
server.use(bodyParser.json());
server.use(cors());

var PORT = process.env.PORT || 3000;
var SERVER_SECRET = process.env.SECRET || "12ka4";



let dbURI = "mongodb+srv://azhar:azhar@mongodb.xd2iy.mongodb.net/testDB?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

////////////////mongodb connected disconnected events///////////////////////////////////////////////

mongoose.connection.on("connected", () => { // MONGODB Connected
    console.log("Mongoose connected");
})


mongoose.connection.on("disconnected", () => {
    console.log("MONGODB disconnected");
    process.exit(1);
});

mongoose.connection.on("error", (err) => {
    console.log("MongoDB disconnected due to : " + err);
    process.exit(1);
});

process.on("SIGINT", () => {
    console.log("App is terminating");
    mongoose.connection.close(() => {
        console.log("MONGODB disconnected");
        process.exit(0);
    })

})

var userSchema = new mongoose.Schema({
    userEmail: String,
    userName: String,
    userPassword: String,
});

var userModel = mongoose.model("users", userSchema);


server.post("/signup", (req, res, next) => {

    if (!req.body.userEmail
        || !req.body.userPassword
        || !req.body.userName
    ) {

        res.status(403).send(`
            please send name, email, passwod, phone and gender in json body.
            e.g:
            {
                "name": "Azhar",
                "email": "azhar@gmail.com",
                "password": "abc",
            }`)
        return;
    }

    userModel.findOne({ userEmail: req.body.userEmail },
        (err, data) => {
            if (!err && !data) {
                bcrypt.stringToHash(req.body.userPassword).then(hashPassword => {

                    var newUser = new userModel({
                        userEmail: req.body.userEmail,
                        userPassword: hashPassword,
                        userName: req.body.userName,
                    });

                    newUser.save((err, data) => {
                        if (!err) {
                            console.log("user created");
                            res.send("user created");
                        }
                        else {
                            console.log("Could not save due to: " + err);
                            res.send("error is =>>" + err);
                        }
                    })
                })
            }
            else if (err) {
                res.status(500).send({
                    message: "Database error"
                })
            }
            else {
                res.send({
                    message: "user already exists",
                })
            }
        })
});

server.post("/login", (req, res, next) => {

    if (!req.body.userEmail || !req.body.userPassword) {
        res.status(403).send(`
            please send email and password in json body
            e.g:
            {
            userEmail : "abc@gmail.com",
            userPassword: "1234",
            }
         `)
        return;
    }

    userModel.findOne({ userEmail: req.body.userEmail }, (err, user) => {
        if (err) {
            res.status(503).send({
                message: "an error occured " + JSON.stringify(err),
            })
        }
        else if (user) {
            console.log(req.body.userPassword);
            console.log(user.userPassword);
            bcrypt.varifyHash(req.body.userPassword, user.userPassword).then(isMatched => {
                if (isMatched) {

                    var token =
                        jwt.sign({
                            id: user._id,
                            userEmail: user.userEmail,
                            userName: user.userName,
                            userPassword: user.userPassword,
                            ip: req.connection.remoteAddress
                        }, SERVER_SECRET)

                    res.status(200).send({
                        message: "signed in succesfully",
                        user: {
                            userEmail: user.userEmail,
                            userName: user.userName,
                        },
                        token: token,
                    })
                } else {
                    res.status(409).send({
                        message: "Password not matched",
                    })
                }
            })
        }
        else {
            res.status(409).send({
                message: "User not found",
            })
        }
    })
})

server.get("/profile", (req, res) => {

    if (!req.headers) {
        res.send(`
        please provide token in headers,
        e.g:
        {
            "token" : "354564987231657498"
        }
        `)
        return;
    }

    var decodedData = jwt.verify(req.headers.token, SERVER_SECRET);
    console.log("user ==> " + user)

    userModel.findOne(decodedData.id, "userEmail userName createdOn", (err, user) => {
        if (!err) {
            res.send({
                profile: user,
            })
        }
        else {
            res.status(505).send({
                message: "server error",
            })
        }
    })


})


server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})

