import lyricModel from "./schema.js";
import { Router } from "express";
import createHttpError from "http-errors";

const lyricsRouter = Router();

//post a lyrics
lyricsRouter.post("/", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//get the lyrics
lyricsRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//get lyrics by id
lyricsRouter.get("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//update lyrics
lyricsRouter.put("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//delete a lyrics
lyricsRouter.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default lyricsRouter;
