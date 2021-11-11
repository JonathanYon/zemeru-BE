import { Router } from "express";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import messageModel from "./schema.js";

const messagesRouter = Router();

//post a lyrics
messagesRouter.post("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await messageModel({
      ...req.body,
      from: req.user._id,
      to: req.params.id,
    }).save();

    res.status(201).send(lyric._id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default messagesRouter;
