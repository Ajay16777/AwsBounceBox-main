const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ProjectController = require("../controllers/Project");
const validator = require("./validators/Projectvalidator");

// @route   POST api/projects
// @desc    Create a project
// @access  Public
router.post(
  "/Create",
  auth.verifyToken,
  validator.createProject,
  ProjectController.createProject
);

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get("/GetAll", auth.verifyToken, ProjectController.getAllProjects);


//download project files via key
// @route   GET api/projects/download/:id
// @desc    Download project files
// @access  Public
router.post("/Download", auth.verifyToken, ProjectController.downloadProjectFiles);


// @route   GET api/projects/:id
// @desc    Get a project by id
// @access  Public
router.get(
  "/Get/:id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  ProjectController.getProjectById
);

// @route   PUT api/projects/:id
// @desc    Update a project by id
// @access  Public
router.patch(
  "/Update/:id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  validator.updateProject,
  ProjectController.updateProjectById
);

router.patch(
  "/tags/:id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  ProjectController.updateProjectTags
);

// @route   DELETE api/projects/:id
// @desc    Delete a project by id
// @access  Public
router.delete(
  "/Delete/:id",
  auth.verifyToken,
  validator.checkOwner,
  ProjectController.deleteProjectById
);

//delete collaborator
// @route   DELETE api/projects/:id/collaborator/:collaborator_id
// @desc    Delete a collaborator by id
// @access  Public
router.delete(
  "/DeleteCollaborator/:id/:collaborator_id",
  auth.verifyToken,
  validator.verifyProjectAccess,
  ProjectController.deleteCollaborator
);






module.exports = router;
