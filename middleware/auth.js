const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const logger = require('../logger');

function verifyToken(req, res, next) {
  console.log("verifyToken");
  
  var token = req.headers["x-access-token"];
  console.log(token);
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." , err: err});


   //find user by id
    User.findById(decoded._id)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }
        req.userId = user._id;
        next();
      }
      )
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Something went wrong",
        });
      }
      );



   
  });
}

//verifyAdmin
function verifyAdmin(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    //find user by id
    User.findById(decoded._id)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }
        req.userId = user._id;
        req.IsAdmin = user.isAdmin;
        next();
      }
      )
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Something went wrong",
        });
      }
      );
      
  });
}

module.exports = { verifyToken, verifyAdmin };
