import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    authors: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
    content: { type: String, required: true },
    comments: [
      {
        comment: String, //embedded comments inside the post for the comment
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
  },
  { timestamps: true }
);

export default model(`Blog`, blogSchema);
