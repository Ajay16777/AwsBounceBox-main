const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const VersionController = require("../controllers/Version");
const validator = require("./validators/Projectvalidator");

// @route   POST api/projects/version
// @desc    Create a version
// @access  Public
router.post(
  "/Create/:id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  validator.createVersion,
  VersionController.createVersion
);

// @route   GET api/projects/version/:id
// @desc    Get a version by id
// @access  Public
router.get("/Get/:id/:version_id", auth.verifyToken, validator.verifyProjectAccess, VersionController.getVersionById);

// @route   GET api/projects/version
// @desc    Get all version
// @access  Public
router.get(
  "/GetAll/:id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  VersionController.getAllVersions
);

// @route   DELETE api/projects/version/:id
// @desc    Delete a version by id
// @access  Public
router.delete(
  "/Delete/:id/:version_id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  VersionController.deleteVersionById
);

// @route   PUT api/projects/version/:id
// @desc    Update a version by id
// @access  Public
// router.put(
//   "/Update/:id",
//   auth.verifyToken,
//   VersionController.updateVersionById
// );

module.exports = router;
