import mongoose from "mongoose";

const { Schema, model } = mongoose;

const lyricsSchema = new Schema(
  {
    artist: { type: String, required: true },
    title: { type: String, required: true },
    officialLyric: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    editorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },

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
    coverImage: {
      type: String,
      default:
        "https://res.cloudinary.com/catholic-university-of-murcia/image/upload/v1636118231/Zemeru/sibhzfvvgrbxdrs0zopz.png",
    },
    mezmurType: { type: String, required: true },
    comments: [
      {
        comment: String, //embedded comments inside the lyrics for the comment
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
  },
  { timestamps: true }
);
export default model("Lyrics", lyricsSchema);
