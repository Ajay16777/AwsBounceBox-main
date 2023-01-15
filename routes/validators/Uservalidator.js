const validator = require("validator");
const { User } = require("../../models/User");
const Project = require("../../models/Project");
const Request = require("../../models/Request");
const logger = require("../../logger");

async function register(req, res, next) {
  try {
    // email firstName lastName artistName password are required
    const userData = req.body;
    console.log(userData);
    // check if all fields are filled
    if (
      !userData.email ||
      !userData.firstName ||
      !userData.lastName ||
      !userData.artistName ||
      !userData.password
    ) {
      return res.status(400).send({
        message: "Please fill all fields",
        fields: ["email", "firstName", "lastName", "artistName", "password"],
      });
    }
    // check if email is valid
    if (!validator.isEmail(userData.email)) {
      return res.status(400).send({ message: "Invalid email" });
    }
    // check if password is valid
    if (!validator.isLength(userData.password, { min: 6 })) {
      return res
        .status(400)
        .send({ message: "Password must be at least 6 characters" });
    }
    //check if email is already in use
    const user = await User.findOne({ email: userData.email });
    if (user) {
      return res.status(400).send({ message: "Email already in use" });
    }

    next();
  } catch (error) {
    logger.error("Error While Verifying User Data");
    logger.error(error);
    res.json(error);
  }
}
async function login(req, res, next) {
  try {
    // email and password are required
    const userData = req.body;
    // check if all fields are filled
    if (!userData.email || !userData.password) {
      return res.status(400).send({
        message: "Please fill all fields",
        fields: ["email", "password"],
      });
    }

    next();
  } catch (error) {
    logger.error("Error While Verifying User Data");
    logger.error(error);
    res.json(error);
  }
}

// sendCollaboratorRequest
async function sendCollaboratorRequest(req, res, next) {
  try {
    // sender_id and receiver_id, project_id are required
    let userId = req.userId;
    req.body.sender_id = userId;
    const userData = req.body;
    // check if all fields are filled
    if (!userData.sender_id || !userData.receiver_email || !userData.project_id) {
      return res.status(400).send({
        message: "Please fill all fields",
        fields: ["sender_id", "receiver_email", "project_id"],
      });
    }
    // check if sender_id is valid
    const sender = await User.findById(userData.sender_id);
    if (!sender) {
      return res.status(400).send({ message: "Sender not found" });
    }
    // check if receiver_id is valid
    const receiver = await User.find({email: userData.receiver_email});
    if (!receiver) {
      return res.status(400).send({ message: "Receiver not found" });
    }
    // check if project_id is valid
    const project = await Project.findById(userData.project_id);
    if (!project) {
      return res.status(400).send({ message: "Project not found" });
    }

    req.body.sender_email = sender.email;
    req.body.senderImage = sender.Image;
    req.body.sender_artistName = sender.artistName;


    next();
  } catch (error) {
    logger.error("Error While Verifying User Data");
    logger.error(error);
    res.json(error);
  }

}

// acceptRequest
async function acceptRequest(req, res, next) {
  try {
    let userId = req.userId;
    let user = await User.findById(userId);
    let request = await Request.findById(req.params.id);
    if (request) {
      if (request.receiver_email == user.email) {
        req.body.receiver_id = userId;
        next();
      } else {
        return res.status(400).send({ message: "You are not authorized" });
      }
    }
  } catch (error) {
    logger.error("Error While Verifying Accept Request Data");
    logger.error(error);
    res.json(error);
  }
}

// rejectRequest
async function rejectRequest(req, res, next) {
  try {
    let userId = req.userId;
    let user = await User.findById(userId);
    let request = await Request.findById(req.params.id);
    if (request) {
      if (request.receiver_email == user.email) {
        req.body.receiver_id = userId;
        next();
      } else {
        return res.status(400).send({ message: "You are not authorized" });
      }
    }
  } catch (error) {
    logger.error("Error While Verifying Reject Request Data");
    logger.error(error);
    res.json(error);
  }
}

module.exports = {
  register,
  login,
  sendCollaboratorRequest,
  acceptRequest,
  rejectRequest,
};
