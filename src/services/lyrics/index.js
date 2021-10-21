import lyricModel from "./schema.js";
import { Router } from "express";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";

const lyricsRouter = Router();

//post a lyrics
lyricsRouter.post("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel(req.body).save();
    res.status(201).send(lyric._id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//get the lyrics
lyricsRouter.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel.find();
    if (req.query && req.query.title) {
      let lyricResult = lyric.filter(
        (oneLyric) => oneLyric.title === req.query.title
      );
      res.send(lyricResult);
    } else if (req.query && req.query.artist) {
      let lyricResult = lyric.filter(
        (oneLyric) => oneLyric.artist === req.query.artist
      );
      res.send(lyricResult);
    } else if (req.query && req.query.officialLyric) {
      let lyricResult = lyric.filter(
        (oneLyric) => oneLyric.officialLyric === req.query.officialLyric
      );
      res.send(lyricResult);
    } else if (req.query && req.query.mezmurType) {
      let lyricResult = lyric.filter(
        (oneLyric) => oneLyric.mezmurType === req.query.mezmurType
      );
      res.send(lyricResult);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//get lyrics by id
lyricsRouter.get("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel.findById(req.params.id);
    if (lyric) {
      res.send(lyric);
    } else {
      res.send(`lyric ${req.params.id} is NOT found!!`);
    }
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
