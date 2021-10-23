import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import lyricsRouter from "./services/lyrics/index.js";
import usersRouter from "./services/users/index.js";
import blogsRouter from "./services/blog/index.js";

const server = express();
const port = process.env.PORT || 3003;

server.use(cors());
server.use(express.json());

server.use("/lyrics", lyricsRouter);
server.use("/users", usersRouter);
server.use("/blogs", blogsRouter);

mongoose.connect(process.env.MONGOS_CON);
mongoose.connection.on(`connected`, () => {
  // the string "connected" 👆☝ has to be "connected" nothing more nothing less
  console.log(`🎁 mongo connected Successfully!!`);
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`server running on: ${port}`);
  });
});

mongoose.connection.on(`error`, (err) => {
  console.log(`Mongo Error: ${err}`);
});
