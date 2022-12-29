const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const Project = require("../models/Project");
const Request = require("../models/Request");
const { uploadImage, deleteFile } = require("../utils/utils");

//rgister user in the database and return the user
async function register(req, res) {
  console.log(req.body);
  const userData = req.body;

  try {
    // if req.files is not empty then upload the file and save the path in the database and save the user
    if (req.files) {
      let dir = `uploads/users/${userData.email}`;
      const image = await uploadImage(req.files.image, dir);
      userData.Image = image.Location;
      userData.ImageKey = image.Key;
    }

    const user = await User.register(userData);

    res.send(user);
  } catch (error) {
    res.json(error);
    ``;
  }
}
// login user and return the user use async/await
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    if (user) {
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } else {
      res.status(400).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.json(error);
  }
}

// getUser
async function getUser(req, res) {
  const id = req.userId;
  try {
    const user = await User.findById(id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

// updateUser
async function updateUser(req, res) {
  const id = req.userId;
  const userData = req.body;
  try {
    //if userdata has password, hash it
    if (userData.password) {
      const hash = await bcrypt.hashSync(userData.password, 10);
      userData.password = hash;
    }
    //if req.files is not empty then upload the file and save the path in the database and save the user
    if (req.files) {
      //first delete the old image
      const user = await User.findById(id);
      let dir = `uploads/users/${user.email}`;
      await deleteFile(user.ImageKey);
      //then upload the new image
      const image = await uploadImage(req.files.image, dir);
      userData.Image = image.Location;
      userData.ImageKey = image.Key;
    }

    const user = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

//deleteUser
async function deleteUser(req, res) {
  const id = req.userId;
  try {
    const user = await User.findByIdAndDelete(id);
    if (user) {
      //delete user image
      await deleteFile(user.ImageKey);

      res.json({ message: "User deleted", user });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

// sendCollaboratorRequest
async function sendCollaboratorRequest(req, res) {
  try {
    let userData = req.body;
    //save request
    const request = await Request.create(userData);
    let data = {};
    if (request) {
      data.request = request;
      data.message = "Request sent";
    }
    res.send(data);
  } catch (error) {
    res.json(error);
  }
}

//getAllSentRequests
async function getAllSentRequests(req, res) {
  const id = req.userId;
  try {
    const requests = await Request.find({ sender_id: id });
    if (requests) {
      //instead of project id, send project name , project id and project image to the frontend
      let data = [];
      for (let i = 0; i < requests.length; i++) {
        let project = await Project.findById(requests[i].project_id);
        let obj = {
          project_name: project.projectName,
          project_id: project._id,
          project_image: project.Image,
          request: requests[i],
        };
        data.push(obj);
      }
      res.send(data);
    } else {
      res.status(404).send({ message: "Requests not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

//getAllReceivedRequests
async function getAllReceivedRequests(req, res) {
  const id = req.userId;
  let user = await User.findById(id);
  try {
    const requests = await Request.find({ receiver_email: user.email, status: "pending" });
    if (requests) {
      //instead of project id, send project name , project id and project image to the frontend
      let data = [];
      for (let i = 0; i < requests.length; i++) {
        let project = await Project.findById(requests[i].project_id);
        let obj = {
          project_name: project.projectName,
          project_id: project._id,
          request: requests[i],
        };
        data.push(obj);
      }
      res.send(data);
      
    } else {
      res.status(404).send({ message: "Requests not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

//acceptRequest
async function acceptRequest(req, res) {
  const id = req.userId;
  const requestId = req.params.id;
  try {
    //accept request and add user to project
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    );
    if (request) {
      const project = await Project.findByIdAndUpdate(
        request.project_id,
        { $push: { collaborators: req.body.receiver_id } },
        { new: true }
      );
      if (project) {
        res.send(project);
      } else {
        res.status(404).send({ message: "Project not found" });
      }
    }
  } catch (error) {
    res.json(error);
  }
}

//rejectRequest
async function rejectRequest(req, res) {
  const id = req.userId;
  const requestId = req.params.id;
  try {
    //reject request
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: "rejected" },
      { new: true }
    );
    if (request) {
      res.send(request);
    } else {
      res.status(404).send({ message: "Request not found" });
    }
  } catch (error) {
    res.json(error);
  }
}

module.exports = {
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
};
