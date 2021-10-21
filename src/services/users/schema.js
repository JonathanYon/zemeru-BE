import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UsersSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default: "https://bit.ly/3lBk8d3",
    },
    role: {
      type: String,
      required: true,
      enum: ["User", "Editor"],
      default: "User",
    },
    password: {
      type: String,
      required: function () {
        if (this.googleId !== null || this.facebookId !== null) {
          return;
        }
      },
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    refreshT: { type: String },
    googleId: { type: String },
    facebookId: { type: String },
  },

  { timestamps: true }
);

//password hashing

UsersSchema.pre("save", async function (next) {
  const thisUser = this;
  const plainPassword = thisUser.password;
  if (thisUser.isModified("password")) {
    thisUser.password = await bcrypt.hash(plainPassword, 11);
  }
  next();
});
// update logged user info
UsersSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  //   console.log("getUpdate()-->", update);
  const { password: plainPassword } = update;
  if (plainPassword) {
    const password = await bcrypt.hash(plainPassword, 11);
    this.setUpdate({ ...update, password });
  }
});
// removing password from the get route
UsersSchema.methods.toJSON = function () {
  const userInfo = this;
  const userObj = userInfo.toObject();
  delete userObj.password;
  return userObj;
};
// compare pass & email to the hashed one
UsersSchema.statics.checkCredential = async function (email, plainPassword) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    // console.log(isMatch);
    if (isMatch) return user;
    else null;
  } else {
    return null;
  }
};

export default model("User", UsersSchema);
