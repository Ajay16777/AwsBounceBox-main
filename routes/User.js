const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  sendCollaboratorRequest,
  getAllSentRequests,
  getAllReceivedRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/User");
const validator = require("./validators/Uservalidator");
const { upload } = require("../utils/utils");

// @route   POST api/users
// @desc    Create a user
// @access  Public
router.post("/register",  validator.register, register);

// @route   POST api/users/login
// @desc    Login a user
// @access  Public
router.post("/login", validator.login, login);

// @route   GET api/users/:id
// @desc    Get a user by id
// @access  Public
router.get("/get", auth.verifyToken, getUser);

// @route   PUT api/users/:id
// @desc    Update a user by id
// @access  Public
router.patch("/update", auth.verifyToken, updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Public
router.delete("/delete", auth.verifyToken, deleteUser);

//send collaborator request
// @route   POST api/users/:id/collaborator_request
// @desc    Send a collaborator request
// @access  Public
router.post(
  "/sendCollaboratorRequest",
  auth.verifyToken,
  validator.sendCollaboratorRequest,
  sendCollaboratorRequest
);

// getAllSentRequests
// @route   GET api/users/:id/sent_requests
// @desc    Get all sent requests
// @access  Public
router.get("/getAllSentRequests", auth.verifyToken, getAllSentRequests);

// getAllReceivedRequests
// @route   GET api/users/:id/received_requests
// @desc    Get all received requests
// @access  Public
router.get("/getAllReceivedRequests", auth.verifyToken, getAllReceivedRequests);

//acceptRequest
// @route   POST api/users/:id/accept_request
// @desc    Accept a request
// @access  Public
router.post(
  "/acceptRequest/:id",
  auth.verifyToken,
  validator.acceptRequest,
  acceptRequest
);
//rejectRequest
// @route   POST api/users/:id/reject_request
// @desc    Reject a request
// @access  Public
router.post(
  "/rejectRequest/:id",
  auth.verifyToken,
  validator.rejectRequest,
  rejectRequest
);

module.exports = router;
