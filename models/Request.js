const mongooes = require("mongoose");
const Schema = mongooes.Schema;

const RequestSchema = new Schema(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_email: {
      type: String,
      required: true,
    },
    senderImage: {
      type: String,
      required: true,
    },
    sender_artistName: {
      type: String,
      required: true,
    },
    receiver_email: {
      type: String,
      required: true,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongooes.model("Request", RequestSchema);
module.exports = Request;



// req.body.sender_email = sender.email;
//     req.body.senderImage = sender.Image;
//     req.body.artistName 