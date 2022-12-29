const multerS3 = require("multer-s3");
const multer = require("multer");
const aws = require("aws-sdk");
const fs = require("fs");
const Version = require("../models/Version");
const { match } = require("assert");


aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-east-1",
});

const s3 = new aws.S3();

const bucket = "bouncebox-bucket";

//upload file
async function uploadFile(file, dir) {
  try {
    //convert object to string
    let fileString = JSON.stringify(file);

    let bufferr = Buffer.from(fileString, "utf8");

    let params = {
      Bucket: bucket,
      Key: dir,
      Body: Buffer.from(file, "binary"),
    };
    let data = await s3.upload(params).promise();
    return data;
  } catch (error) {
    console.log(error);
  }
}

//upload files
async function uploadFiles(files, dir1, key) {
  //run a loop and wait for all files to be uploaded
  let upload_data = [];
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let dir = key + "/" + dir1[i];

    let data = await uploadFile(file, dir);
    //wait for all files to be uploaded
    upload_data.push(data);
  }
  return upload_data;
}

//delete folder form s3
async function deleteFolder(dir) {
  try {
    console.log(dir);
    //  listObjectsV2
    let params = {
      Bucket: bucket,
      Prefix: dir,
    };
    let data = await s3.listObjectsV2(params).promise();
    let objects = data.Contents;
    let deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: [],
        Quiet: false,
      },
    };
    for (let i = 0; i < objects.length; i++) {
      let obj = objects[i];
      deleteParams.Delete.Objects.push({
        Key: obj.Key,
      });
    }
    let data1 = await s3.deleteObjects(deleteParams).promise();
    return data1;
  } catch (error) {
    console.log(error);
  }
}


async function uploadImage(file, dir) {
  console.log("uploadImage");
  try {
   let Image_buffer = file.data;
    
    let params = {
      Bucket: bucket,
      Key: dir+"/"+file.name,
      Body: Image_buffer,
      ACL: "public-read",
    };
    let data = await s3.upload(params).promise();

    //generate the url for the image 
    let urlParams = {
      Bucket: bucket,
      Key: data.Key
    };

    
    return data;
    
  }
  catch (error) {
    console.log(error);
  }

}

//delete file from s3
async function deleteFile(key) {
  try {
    let params = {
      Bucket: bucket,
      Key: key,
    };
    let data = await s3.deleteObject(params).promise();
    return data;
  } catch (error) {
    console.log(error);
  }
}

//download file from s3
async function downloadFile(key) {
  console.log("downloadFile");
  console.log(key);
  try {
    let params = {
      Bucket: bucket,
      Key: key,
    };
    let data = await s3.getObject(params).createReadStream();
    return data;
  } catch (error) {
    console.log(error);
  }
}


//create version 
async function createVersion(data) {
  try {
    //a random id for the version
    let id = Math.random().toString(36).substring(7);
 //first upload the files to s3
 let dir = data.project_id + "/" + id;
  let uploadSamples = [];
  //upload the sample files
  for (let i = 0; i < data.samples.length; i++) {
    let sample = data.samples[i];
    let file = sample.data;
    let key = dir + "/samples/" + sample.path;
    let data2 = await uploadFile(file, key);
    data2.IsBounceFile = sample.IsBounceFile;
    uploadSamples.push(data2);
  }

  console.log("all files uploaded");
 
//create the version
  let version = new Version({
    project_id: data.project_id,
    versionName: data.versionName,
    version_comment: data.versionComment,
    Version_Samples: uploadSamples,
    previousVersion_id: data.previousVersion_id,
    artistName : data.artistName,
      artistImage: data.artistImage,
  });
  let versionData = await version.save();
  return versionData;

  } catch (error) {
    console.log(error);
  }
}











module.exports = { uploadFile, uploadFiles, deleteFolder, uploadImage,deleteFile , downloadFile, createVersion};
