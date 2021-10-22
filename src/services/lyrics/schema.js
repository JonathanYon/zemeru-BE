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
        updatedArtist: String,
        updatedTitle: String,
        updatedYoutubeLink: String,
        updatedCoverImage: String,
      },
    ],
    releaseDate: { type: Date },
    youtubeLink: { type: String },
    coverImage: { type: String, default: "https://bit.ly/3lBk8d3" },
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
