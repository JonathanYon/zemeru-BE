import mongoose from "mongoose";

const { Schema, model } = mongoose;

const lyricsSchema = new Schema(
  {
    artist: { type: String, required: true },
    title: { type: String, required: true },
    officialLyric: { type: String, required: true },
    editedLyrics: [{ type: String }],
    releaseDate: { type: Date },
    role: {
      type: String,
      required: true,
      enum: ["User", "Editor"],
      default: "User",
    },
    youtubeLink: { type: String },
    coverImage: { type: String },
    mezmurType: { type: String, required: true },
    comments: [
      {
        comment: String, //embedded comments inside the post for the comment
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
  },
  { timestamps: true }
);
export default model("Lyrics", lyricsSchema);
