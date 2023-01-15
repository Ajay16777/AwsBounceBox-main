const Project = require("../models/Project");
const { User } = require("../models/User");
const { createVersion, downloadFile } = require("../utils/utils");
const logger = require("../logger");

//create a new project
async function createProject(req, res) {
  let user_id = req.userId;
  const projectData = req.body;

  try {
    //create a new project
    const project = await Project.create({
      projectName: projectData.projectName,
      artWork: projectData.artWork,
      user_id: user_id,
      collaborators: [],
      artistName: projectData.artistName,
      project_comment: projectData.description,
      tags: projectData.tags,
    });
    let versionName = projectData.projectName + " " + "v1";

    //create a new version
    let data = {
      project_id: project._id,
      user_id: user_id,
      versionName: versionName,
      artistName: projectData.artistName,
      artistImage: req.artistImage,
      versionComment: "Initial version",
      samples: projectData.samples,
      previousVersion_id: null,
    };
    const version = await createVersion(data);

    //update the project with the version id
    const projectWithVersion = await Project.findByIdAndUpdate(
      project._id,
      {
        $push: { version_id: version._id },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    //update the user with the project id
    const user = await User.findByIdAndUpdate(
      user_id,
      {
        $push: { project_id: project._id },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ message: "Project created", project, version });
  } catch (error) {
    logger.error("Error While Creating Project");
    logger.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

// getAllProjects
async function getAllProjects(req, res) {
  let user_id = req.userId;
  try {
    const projects = await Project.find({ user_id });
    //now search for the projects that the user is a collaborator
    const projectsCollaborator = await Project.find({
      collaborators: { $in: user_id },
    });
    //we add the projects that the user is a collaborator to the projects array
    projects.push(...projectsCollaborator);

    //for each project we get the details of the collaborators
    for (let i = 0; i < projects.length; i++) {
      let collaborators = [];
      for (let j = 0; j < projects[i].collaborators.length; j++) {
        let collaborator = await User.findById(projects[i].collaborators[j]);
        collaborators.push(collaborator);
      }
      projects[i].collaborators = collaborators;
    }

    res.send(projects);
  } catch (error) {
    logger.error("Error While Getting All Projects");
    logger.error(error);
    res.json(error);
  }
}

//getProjectById
async function getProjectById(req, res) {
  let user_id = req.userId;
  let project_id = req.params.id;
  try {
    // in proeject.collaborators we have the id of the collaborators of the project so we need to get the details of the collaborators from the user model
    const project = await Project.findById(project_id);
    if (project) {
      //for each collaborator in the project we get the details from the user model
      let collaborators = [];
      for (let i = 0; i < project.collaborators.length; i++) {
        let collaborator = await User.findById(project.collaborators[i]);
        collaborators.push(collaborator);
      }
      //we add the collaborators to the project object
      project.collaborators = collaborators;
      res.send(project);
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    logger.error("Error While Getting Project By Id");
    logger.error(error);
    res.json(error);
  }
}

//updateProjectById
async function updateProjectById(req, res) {
  let user_id = req.userId;
  let project_id = req.params.id;
  const projectData = req.body;
  projectData.project_comment = projectData.description;
  try {
    const project = await Project.findByIdAndUpdate(project_id, projectData, {
      new: true,
      runValidators: true,
    });
    if (project) {
      res.send(project);
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    logger.error("Error While Updating Project By Id");
    logger.error(error);
    res.json(error);
  }
}

// deleteProjectById
async function deleteProjectById(req, res) {
  let user_id = req.userId;
  let project_id = req.params.id;
  try {
    const project = await Project.findByIdAndDelete(project_id);
    if (project) {
      const user = await User.findByIdAndUpdate(
        user_id,
        {
          $pull: { project_id: project_id },
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.json({ message: "Project deleted", project });
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    logger.error("Error While Deleting Project By Id");
    logger.error(error);
    res.json(error);
  }
}

//sendCollaboratorRequest
async function sendCollaboratorRequest(req, res) {
  let user_id = req.userId;
  let project_id = req.params.id;
  try {
    let collaborator = await User.findOne({
      email: req.body.collaborator_email,
    });
    if (collaborator) {
      let project_access_request = {
        user_id: user_id,
        project_id: project_id,
        collaborator_id: collaborator._id,
        message: req.body.message,
      };
      const user = await User.findByIdAndUpdate(
        collaborator._id,
        {
          $push: { project_access_request: project_access_request },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      const project = await Project.findByIdAndUpdate(
        project_id,
        {
          $push: { collaborator_requests: collaborator._id },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.json({ message: "Collaborator request sent", user, project });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    logger.error("Error While Sending Collaborator Request");
    logger.error(error);
    res.json(error);
  }
}

// deleteCollaborator
async function deleteCollaborator(req, res) {
  let user_id = req.userId;
  let project_id = req.params.id;
  let collaborator_id = req.params.collaborator_id;
  try {
    const project = await Project.findByIdAndUpdate(
      project_id,
      {
        $pull: { collaborator_requests: collaborator_id },
        $pull: { collaborators: collaborator_id },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (project) {
      res.json({ message: "Collaborator deleted", user, project });
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    logger.error("Error While Deleting Collaborator");
    logger.error(error);
    res.json(error);
  }
}

// updateProjectTags
async function updateProjectTags(req, res) {
  let user_id = req.userId;
  let project_id = req.params.id;
  let tags = req.body.tags;
  try {
    const project = await Project.findByIdAndUpdate(
      project_id,
      {
        $set: { tags: tags },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (project) {
      res.json({ message: "Tags updated", project });
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    logger.error("Error While Updating Project Tags");
    logger.error(error);
    res.json(error);
  }
}

// downloadProjectFiles
async function downloadProjectFiles(req, res) {
  let user_id = req.userId;
  //check if user provided key of file to download
  if (!req.body.key) {
    res.status(400).send({ message: "Please provide key of file to download" });
  }
  let key = req.body.key;
  try {
    let file = await downloadFile(key);
    file.pipe(res);
  } catch (error) {
    logger.error("Error While Downloading Project Files");
    logger.error(error);
    res.json(error);
  }
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  sendCollaboratorRequest,
  deleteCollaborator,
  updateProjectTags,
  downloadProjectFiles,
};
