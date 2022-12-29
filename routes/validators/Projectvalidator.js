const Project = require("../../models/Project");
const { User } = require("../../models/User");
const multiparty = require("multiparty");

//create a new project
async function createProject(req, res, next) {
  const projectData = req.body;
  console.log("project data", projectData);
  try {
    if (
      !projectData.projectName ||
      !projectData.artWork ||
      !projectData.artistName ||
      !projectData.samples ||
      !projectData.description ||
      !projectData.tags
    ) {
      return res.status(400).json({
        message: {
          required_field: [
            "projectName",
            "artWork",
            "artistName",
            "samples",
            "description",
            "tags",
          ],

          message: "All fields are required",
        },
      });
    }
    //check if project name is already in use by the user
    let user = await User.findById(req.userId);
    const project = await Project.findOne({
      projectName: projectData.projectName,
      user_id: req.userId,
    });
    if (project) {
      return res.status(400).json({
        message: "Project name already in use",
      });
    }
    req.artistImage = user.Image;
    next();
  } catch (error) {
    res.json(error);
  }
}


//verify project access
async function verifyProjectAccess(req, res, next) {
  const id = req.params.id;
  try {
    const project = await Project.findById(id);
    if (project) {
      console.log(project.user_id.toString());
      console.log(req.userId);
      //check if user is the owner of the project or collaborator
      if (project.user_id.toString() === req.userId.toString()) {
        next();
      } else if (project.collaborators.includes(req.userId)) {
        next();
      } else if (req.IsAdmin === true) {
        next();
      } else {
        res.status(403).send({ message: "You are not authorized" });
      }
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

//version create
async function createVersion(req, res, next) {
  console.log("create version");
  const versionData = req.body;
  let project_id = req.params.id;
  if(req.params.id === undefined){
   res.status(400).send({message: "Project id is required"})
  }


  let user = await User.findById(req.userId);
  try {
  
  

    console.log(versionData);

    if (
      !versionData.comments ||
      !versionData.previousVersion_id ||
      !versionData.versionName ||
      !versionData.samples||
      !versionData.artistName
    ) {
      return res.status(400).json({
        message: {
          required_field: [
            "comments",
            "previousVersion_id",
            "versionName",
            "samples" ,
            "artistName"
           ],

          message: "All fields are required",
        },
      });
    } else {
      //generate a new version name
      const project = await Project.findById(project_id);
      const versions = project.version_id;
      console.log("versions", versions);
      if (project) {
        //check if project.version_id array includes the previousVersion_id
        if (project.version_id.includes(versionData.previousVersion_id)) {
          console.log("version id is valid");
          req.artistImage = user.Image;
          next();
        } else {
          console.log("version id is not valid");
          res.status(400).send({ message: "Invalid previous version id" });
        }

        console.log("project found");
      }
      else{
        res.status(404).send({message: "Project not found"})
      }
    }
  } catch (error) {
    res.json(error);
  }
}

//check if user is owner of the project
async function checkOwner(req, res, next) {
  const id = req.params.id;
  try {
    const project = await Project.findById(id);
    if (project) {
      if (project.user_id.toString() === req.userId.toString()) {
        next();
      } else {
        res.status(403).send({ message: "You are not authorized" });
      }
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

//project update validator
async function updateProject(req, res, next) {
  const projectData = req.body;
  //if user is send anythig other than this fields, it will be ignored
  const allowedFields = ["projectName", "artWork", "artistName", "description"];

  const fields = Object.keys(projectData);
  const isValidOperation = fields.every((field) =>
    allowedFields.includes(field)
  );
  if (!isValidOperation) {
    return res.status(400).send({ message: "Invalid updates" });
  }
  next();
}

module.exports = {
  createProject,
  verifyProjectAccess,
  createVersion,
  checkOwner,
  updateProject,
};
