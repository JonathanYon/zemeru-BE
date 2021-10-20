import mongoose from "mongoose";

const { Schema, module } = mongoose;

const lyricsSchema = new Schema(
  {
    artist: { type: String, required: true },
    title: { type: String, required: true },
    lyrics: { type: String, required: true },
    releaseDate: { type: Date },
    youtubeLink: { type: String },
    coverImage: { type: String },
    mezmurType: { type: String, required: true },
  },
  { timestamps: true }
);
export default module("Lyrics", lyricsSchema);
