import { Router } from "express";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import messageModel from "./schema.js";

const messagesRouter = Router();

//message exchange
messagesRouter.post("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const message = await messageModel.findOne({
      messages: {
        $elemMatch: {
          $or: [
            { from: req.user._id, to: req.params.id },
            { from: req.params.id, to: req.user._id },
          ],
        },
      },
    });

    console.log("mess--->", message);

    if (message) {
      const addMessage = await messageModel.findOneAndUpdate(
        {
          messages: {
            $elemMatch: {
              $or: [
                { from: req.user._id, to: req.params.id },
                { from: req.params.id, to: req.user._id },
              ],
            },
          },
        },
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
    const chatMe = await messageModel.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    });
    //   .populate({
    //     select: "-__v -createdAt -updatedAt -_id -from -to",
    //   });
    if (chatMe) {
      res.send(chatMe);
    } else {
      next(createHttpError(404, "Not Chats to be Found!"));
    }
  } catch (error) {
    next(createHttpError(404));
  }
});
//get my messages
messagesRouter.get("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const chatMe = await messageModel.find({
      $or: [{ from: req.params.id }, { to: req.params.id }],
    });
    if (chatMe) {
      res.send(chatMe);
    } else {
      next(createHttpError(404, "Not Chats to be Found!"));
    }
  } catch (error) {
    next(createHttpError(404));
  }
});
export default messagesRouter;
