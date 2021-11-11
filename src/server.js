import express from "express";
import cors from "cors";
import Pusher from "pusher";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import lyricsRouter from "./services/lyrics/index.js";
import usersRouter from "./services/users/index.js";
import blogsRouter from "./services/blog/index.js";
import messagesRouter from "./services/messages/index.js";

const server = express();
const port = process.env.PORT || 3003;

const pusher = new Pusher({
  appId: "1295753",
  key: "0fb50def5b9d8d12554b",
  secret: "5dd0b0329f2879beccf9",
  cluster: "eu",
  useTLS: true,
});

server.use(cors());
server.use(express.json());

server.use("/lyrics", lyricsRouter);
server.use("/users", usersRouter);
server.use("/blogs", blogsRouter);
server.use("/messages", messagesRouter);

mongoose.connect(process.env.MONGOS_CON);
mongoose.connection.on(`connected`, () => {
  // the string "connected" 👆☝ has to be "connected" nothing more nothing less
  console.log(`🎁 mongo connected Successfully!!`);
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`server running on: ${port}`);
  });
});

mongoose.connection.once("open", () => {
  console.log("another one");
  const msgCollection = mongoose.connection.collection("Messages");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);
  });
});

mongoose.connection.on(`error`, (err) => {
  console.log(`Mongo Error: ${err}`);
});
