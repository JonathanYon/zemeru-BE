import lyricModel from "./schema.js";
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
    const lyric = await lyricModel.find().limit(10);
    res.send(lyric);
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
lyricsRouter.put(
  "/updateLyrics/:id",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const updatedInfo = {
        //best hack to input to an array come check again!!
        updatedLyric: req.body.updatedLyric,
        userId: req.user._id,
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
          const lyric = await lyricModel.findOneAndUpdate(
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
          );
          console.log("hello");
          res.send(lyric);
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
  "/approve/:lyricsID/admin/:editedID",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role === "Editor") {
        const comment = await lyricModel.findOneAndUpdate(
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
        );

        console.log("hello");
        res.send("Gone for good");
      } else {
        res.send("you not admin bra!!");
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
      const post = await lyricModel.findById(req.params.id);
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

lyricsRouter.put(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const comment = await lyricModel.findById(req.params.id);
      if (comment) {
        const commentUpdate = await lyricModel.findOneAndUpdate(
          { _id: req.params.commentId, userId: req.user._id },
          { $set: { "comments.$": req.body } },
          { new: true }
        );
        if (commentUpdate) {
          res.send(commentUpdate);
        } else {
          res.send("Not UPDATED");
        }
        res.send("Found");
      } else {
        res.send("No such comment");
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(404));
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
