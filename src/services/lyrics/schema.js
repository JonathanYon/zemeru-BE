import mongoose from "mongoose";

const { Schema, model } = mongoose;

const lyricsSchema = new Schema(
  {
    artist: { type: String, required: true },
    title: { type: String, required: true },
    officialLyric: { type: String, required: true },
    editedLyrics: [
      {
        updatedLyric: String,
        status: {
          type: String,
          enum: ["Aproved", "Rejected", "Pending"],
          default: "Pending",
        },
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      },
    ],
    releaseDate: { type: Date },
    youtubeLink: { type: String },
    coverImage: { type: String, default: "https://bit.ly/3lBk8d3" },
    mezmurType: { type: String, required: true },
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
export default model("Lyrics", lyricsSchema);
