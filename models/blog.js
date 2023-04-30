const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 5 },
    content: { type: String, required: true, minlength: 50 },
    author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
