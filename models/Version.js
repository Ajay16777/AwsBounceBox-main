const mongooes = require("mongoose");
const Schema = mongooes.Schema;

const VersionSchema = new Schema(
  {
    versionName: {
      type: String,
      required: true,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    artistName : {
      type: String,
      required: true,
    },
    artistImage : {
      type: String,
      required: true,
    },
    previousVersion_id: {
      type: Schema.Types.ObjectId,
      ref: "Version",
    },
    version_comment: {
      type: String,
      required: true,
    },
    Version_Samples: [
      {
        Etag: {
          type: String,
        },
        VersionId: {
          type: String,
        },
        Location: {
          type: String,
        },
        Key: {
          type: String,
        },
        Bucket: {
          type: String,
        },
        IsBounceFile: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Version = mongooes.model("Version", VersionSchema);
module.exports = Version;
