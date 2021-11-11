import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    messages: [
      {
        message: { type: String, required: true },
        from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        to: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        received: {
          type: String,
          enum: ["seen", "delivered"],
          default: "delivered",
        },
      },
    ],

    to: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

export default model(`Message`, messageSchema);
