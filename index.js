const express = require("express");
const app = express();
const config = require("./config");
const cors = require("cors");
const ip = require("ip");
const fileUpload = require("express-fileupload");
const connectDB = require("./mongodb_connction");
const logger = require("./logger");
require("dotenv").config();

const port = config.PORT || 8080;
app.use(fileUpload());
app.use(cors());
//limt the size of the request body 10gb max size 
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ extended: true, limit: "10000" }));


//connect to mongodb
connectDB();

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Server is running on ip ${ip.address()}`);
});

//test connection
app.get("/", (req, res) => {
  //all routes info here

  let routes = [
    {
      method: "GET",
      path: "/",
      description: "Homepage",
      response: "Hello World",
    },
    {
      method: "GET",
      path: "/api/v1/projects",
      description: "Get all projects",
      response: "Array of projects",
    },
    {
      method: "GET",
      path: "/api/v1/projects/:id",
      description: "Get project by id",
      response: "Project",
    },
    {
      method: "POST",
      path: "/api/v1/projects",
      description: "Create a new project",
      response: "Project",
    },
  ];

  res.send(routes);
});

app.use("/api/users", require("./routes/User"));
app.use("/api/projects", require("./routes/Project"));
app.use("/api/versions", require("./routes/Version"));


//error handler middleware
app.use((err, req, res, next) => {
  logger.error(err.message, err);
  res.status(500).send("Something went wrong");
});

//all logs are saved in combined.log file
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
}
);
