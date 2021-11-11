import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    message: { type: String, required: true },
    to: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    received: {
      type: String,
      enum: ["seen", "delivered"],
      default: "delivered",
    },
  },
  { timestamps: true }
);

export default model(`Message`, messageSchema);
