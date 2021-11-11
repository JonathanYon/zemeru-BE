import { Router } from "express";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import messageModel from "./schema.js";

const messagesRouter = Router();

//message exchange
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
    // console.log("message--->", message);
    // console.log("message---2", message2);
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

//get my messages
messagesRouter.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const chatMe = await messageModel.find({ from: req.user._id });
    const chatYou = await messageModel.find({ to: req.user._id });
    // console.log("chatme--", chatMe);
    // console.log("chat you", chatYou);
    if (chatMe && chatYou) {
      res.send({ chatByMe: chatMe, chatByYou: chatYou });
    } else if (chatMe) {
      res.send({ chatByMe: chatMe, chatByYou: chatYou });
    } else if (chatYou) {
      res.send({ chatByMe: chatMe, chatByYou: chatYou });
    } else {
      next(
        createHttpError(404, `The Post you are looking for does NOT exist!`)
      );
    }
  } catch (error) {
    next(createHttpError(404));
  }
});
//get my messages
messagesRouter.get("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const chatMe = await messageModel.findOne({ from: req.params.id });
    const chatYou = await messageModel.findOne({ to: req.params.id });
    // console.log("chatme--", chatMe);
    // console.log("chat you", chatYou);
    if (chatMe && chatYou) {
      res.send({ chatByMe: chatMe, chatByYou: chatYou });
    } else if (chatMe) {
      res.send({ chatByMe: chatMe, chatByYou: chatYou });
    } else if (chatYou) {
      res.send({ chatByMe: chatMe, chatByYou: chatYou });
    } else {
      next(
        createHttpError(404, `The Post you are looking for does NOT exist!`)
      );
    }
  } catch (error) {
    next(createHttpError(404));
  }
});
export default messagesRouter;
