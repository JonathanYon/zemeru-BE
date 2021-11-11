import { Router } from "express";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import messageModel from "./schema.js";

const messagesRouter = Router();

//post a lyrics
messagesRouter.post("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const chat = {
      from: req.user._id,
      to: req.params.id,
    };
    const reply = {
      from: req.params.id,
      to: req.user._id,
    };

    const message = await messageModel.findOne(chat);
    const message2 = await messageModel.findOne(reply);
    console.log("message--->", message);
    console.log("message---2", message2);
    if (message) {
      const addMessage = await messageModel.findOneAndUpdate(
        chat,
        {
          $push: {
            messages: { ...req.body, from: req.user._id, to: req.params.id },
          },
        },
        { new: true }
      );
      //   console.log("addmessage", addMessage);
      res.status(201).send(addMessage);
    } else if (message2) {
      const addMessage = await messageModel.findOneAndUpdate(
        reply,
        {
          $push: {
            messages: { ...req.body, from: req.user._id, to: req.params.id },
          },
        },
        { new: true }
      );
      //   console.log("addmessage", addMessage);
      res.status(201).send(addMessage);
    } else {
      const newMessage = await messageModel({
        from: req.user._id,
        to: req.params.id,
        messages: [
          {
            message: req.body.message,
            from: req.user._id,
            to: req.params.id,
          },
        ],
      }).save();

      res.status(201).send(newMessage);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default messagesRouter;
