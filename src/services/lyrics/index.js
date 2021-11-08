import lyricModel from "./schema.js";
import usersModel from "../users/schema.js";
import { Router } from "express";
import multer from "multer";
import cloudinaryStorage from "../../utils/cloudinaryy.js";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";

const lyricsRouter = Router();

//post a lyrics
lyricsRouter.post("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel({
      ...req.body,
      userId: req.user._id,
    }).save();
    if (lyric) {
      await usersModel.findByIdAndUpdate(req.user._id, {
        $inc: { token: +10 },
      });
    }
    res.status(201).send(lyric._id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

lyricsRouter.post(
  "/:id/cover",
  multer({ storage: cloudinaryStorage }).single("cover"),
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const picUrl = req.file.path;
      const cover = await lyricModel.findByIdAndUpdate(
        req.params.id,
        { coverImage: picUrl },
        { new: true }
      );
      if (cover) {
        await usersModel.findByIdAndUpdate(req.user._id, { token: token + 1 });
        res.send(cover);
      } else {
        next(createHttpError(404, "Not found!!"));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//get the lyrics
lyricsRouter.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel.find().populate({
      path: "userId",
      select: "-refreshT -__v -createdAt -updatedAt",
    });
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
      let lyricResult = lyric.filter((oneLyric) =>
        oneLyric.officialLyric.includes(req.query.officialLyric)
      );
      console.log("መ ዝ ሙ ር", lyricResult);
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

lyricsRouter.get("/all", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel.find().limit(10).populate("userId");
    res.send(lyric);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//get lyrics by id
lyricsRouter.get("/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const lyric = await lyricModel.findById(req.params.id).populate("userId");
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
lyricsRouter.put(
  "/updateLyrics/:id",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const updatedInfo = {
        //best hack to input to an array come check again!!
        userId: req.user._id,
        updatedLyric: req.body.updatedLyric,
      };

      const lyric = await lyricModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            editedLyrics: updatedInfo,
          },
        },

        { new: true }
      );
      if (lyric) {
        res.send(lyric);
      } else {
        next(createHttpError(404, "Not Found!"));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//get all lyrics that the user make some edits to (admin)
lyricsRouter.get(
  "/edited/lyrics",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const updatedLyrics = await lyricModel.find({
        editedLyrics: { $exists: true, $ne: [] },
      });
      if (req.user.role === "Editor") {
        if (updatedLyrics) {
          res.send(updatedLyrics);
        } else {
          res.send("No edit from users Today");
        }
      } else {
        next(createHttpError(403, "Not authorized, tough luck."));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
// delete a lyrics(unfortunatly users won't have that power (admin)
lyricsRouter.delete(
  "/:id",
  jwtAuthMiddleware,

  async (req, res, next) => {
    try {
      if (req.user.role === "Editor") {
        const lyric = await lyricModel.findByIdAndDelete(req.params.id);
        if (lyric) {
          res.send("Gone for Good!!");
        } else {
          res.send(`${req.params.id} NOT FOUND`);
        }
      } else {
        next(createHttpError(403, "Not authorized, tough luck."));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
// approve lyrics edit proposal by users
lyricsRouter.put(
  "/approve/:lyricsID/admin/:editedID",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role === "Editor") {
        const lyricOverWrite = await lyricModel.updateMany(
          {
            _id: req.params.lyricsID,
            "editedLyrics._id": req.params.editedID,
          },
          [
            {
              $set: {
                officialLyric: {
                  $arrayElemAt: ["$editedLyrics.updatedLyric", 0],
                },
              },
            },
          ],
          { new: true }
        );
        if (lyricOverWrite) {
          const lyric = await lyricModel
            .findOneAndUpdate(
              {
                _id: req.params.lyricsID,
                editedLyrics: {
                  $elemMatch: { _id: req.params.editedID },
                },
              },
              {
                $pull: {
                  editedLyrics: { _id: req.params.editedID },
                },
              }
              // { new: true }
            )
            .populate("editedLyrics.userId");
          const delLyr = lyric.editedLyrics.filter(
            (ele) => ele._id.toString() === req.params.editedID.toString()
          );
          await usersModel.findByIdAndUpdate(delLyr[0].userId._id, {
            $inc: { token: +5 },
          });
          console.log("hello");
          res.send({
            officialLyric: lyric.officialLyric,
            approved: delLyr[0].userId._id,
          });
        } else {
          res.send("Successfully overWrote but NOT deleted!!");
        }
      } else {
        res.send("you not admin bra!!");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
// reject lyrics edit proposal by users
lyricsRouter.delete(
  "/reject/:lyricsID/admin/:editedID",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role === "Editor") {
        const lyrics = await lyricModel
          .findOneAndUpdate(
            {
              _id: req.params.lyricsID,
              editedLyrics: {
                $elemMatch: { _id: req.params.editedID },
              },
            },
            {
              $pull: {
                editedLyrics: { _id: req.params.editedID },
              },
            }
          )
          .populate("editedLyrics.userId");
        const delLyr = lyrics.editedLyrics.filter(
          (ele) => ele._id.toString() === req.params.editedID.toString()
        );
        await usersModel.findByIdAndUpdate(delLyr[0].userId._id, {
          $inc: { token: -5 },
        });
        console.log("hello", delLyr);
        res.send({ message: "Gone for good", delLyrics: delLyr[0].userId._id });
      } else {
        res.send("you not admin!!");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//************************************comments**************************************************** */
//post comment

lyricsRouter.post("/post/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const post = await lyricModel.findById(req.params.id);
    if (post) {
      const postComment = await lyricModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: { ...req.body, userId: req.user._id },
          },
        },
        { new: true }
      );
      if (postComment) {
        await usersModel.findByIdAndUpdate(req.user._id, {
          $inc: { token: +1 },
        });
      }
      res.send(postComment);
    } else {
      next(
        createHttpError(404, `The Post you are looking for does NOT exist!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(createHttpError(402));
  }
});

lyricsRouter.get(
  "/post/:id/comments",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const post = await lyricModel
        .findById(req.params.id)
        .populate({ path: "comments.userId" });
      if (post) {
        const allComments = post.comments;
        res.send(allComments);
      } else {
        next(
          createHttpError(404, `The Post you are looking for does NOT exist!`)
        );
      }
    } catch (error) {
      next(createHttpError(404));
    }
  }
);

lyricsRouter.get(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const post = await lyricModel.findById(req.params.id);
      if (post) {
        const comment = post.comments.find(
          (com) => com._id.toString() === req.params.commentId // the .toString is very important
        );
        if (comment) {
          res.send(comment);
        } else {
          next(
            createHttpError(
              404,
              `The comment you are looking for does NOT exist!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `The Post you are looking for does NOT exist!`)
        );
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(404));
    }
  }
);

//this is not working yet!!
lyricsRouter.put(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const commentUpdate = await lyricModel.findOneAndUpdate(
        {
          _id: req.params.id,
          "comments.$.userId": req.user._id,
          "comments.$._id": req.params.commentId,
        },
        { $set: { "comments.$": req.body, userId: req.user._id } },
        { new: true }
      );
      if (commentUpdate) {
        res.send(commentUpdate);
      } else {
        next(createHttpError(404, "Credential problem"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(404, "Not Found"));
    }
  }
);

lyricsRouter.delete(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const lyric = await lyricModel.findById(req.params.id);
      if (lyric) {
        const comment = await lyricModel.findOneAndUpdate(
          {
            comments: {
              $elemMatch: { _id: req.params.commentId, userId: req.user._id },
            },
          },
          {
            $pull: {
              comments: { _id: req.params.commentId },
            },
          }
        );
        if (comment) {
          res.send("Found it and DELETE");
        } else {
          res.send("No comment or/and NOT your comment to delete");
        }
      } else {
        next(createHttpError(404, "lyric Not Found"));
      }
    } catch (error) {
      next(createHttpError(404, "No lyric"));
    }
  }
);
export default lyricsRouter;
