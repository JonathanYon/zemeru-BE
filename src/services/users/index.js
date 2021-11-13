import userModel from "./schema.js";
import lyricsModel from "../lyrics/schema.js";
import blogModel from "../blog/schema.js";
import { Router } from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { validationResult } from "express-validator";
import { userValidator } from "./validations.js";
import cloudinaryStorage from "../../utils/cloudinaryy.js";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import { jwtAuthentication } from "../../auth/token.js";

const usersRouter = Router();

//register
usersRouter.post("/account", async (req, res, next) => {
  try {
    // const errorList = validationResult(req);
    // if (!errorList.isEmpty()) {
    //   next(createHttpError(400, "Bad request"));
    // } else {
    const newUser = await userModel(req.body).save();
    res.status(201).send(newUser._id);
    // }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//login
usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.checkCredential(email, password);
    if (user) {
      const { accessToken, refreshToken } = await jwtAuthentication(user);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(404, "Invalid email or/and password"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// usersRouter.get("/comments/:id", async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });
// usersRouter.put("/:id", async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });
// usersRouter.delete("/:id", async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

//get me
usersRouter.get("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    console.log("meeeeeeeeeeee");
    const me = await userModel
      .findById(req.user)
      .populate("followers.userId")
      .populate("following.userId");
    res.send(me);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//my comments in lyrics
usersRouter.get(
  "/lyrics/comments/me",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      console.log("am in try---");

      const commentsLyr = await lyricsModel.find({
        "comments.userId": req.user._id,
      });
      const lyrAuthor = await lyricsModel.find({
        userId: req.user._id,
      });
      const lyrEditor = await lyricsModel.find({
        "editedLyrics.$.userId": req.user._id,
      });

      // const myEdit = lyrEditor
      //   .map((ele) => ele.editedLyrics)
      //   .flat()
      //   .filter((com) => com.userId === req.user._id).length;

      if (commentsLyr) {
        console.log("am in if---");
        let idAndComments = commentsLyr.map((el) => {
          return {
            id: el._id,
            title: el.title,
            comments: el.comments.map((el) => el.comment),
          };
        });
        res.send({
          commAndID: idAndComments,
          lyrics: lyrAuthor,
          myEdits: lyrEditor.map((ele) => ele.editedLyrics).flat(),
        });
      } else {
        res.send("no comments");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//my comments in blog
usersRouter.get(
  "/blogs/comments/me",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      console.log("am in try---");

      const commentsLyr = await blogModel
        .find({
          "comments.userId": req.user._id,
        })
        .populate("authors");
      if (commentsLyr) {
        console.log("am in if---");
        let idAndComments = commentsLyr.map((el) => {
          return {
            id: el._id,
            title: el.title,
            author: el.authors[0].username,
            comments: el.comments.map((el) => el.comment),
          };
        });
        res.send(idAndComments);
      } else {
        res.send("no comments");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//comments of a user in blog
usersRouter.get(
  "/blogs/comments/:userId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      console.log("am in try---");
      const commentsLyr = await blogModel
        .find({
          "comments.userId": req.params.userId,
        })
        .populate("authors");
      if (commentsLyr) {
        console.log("am in if---");
        let idAndComments = commentsLyr.map((el) => {
          return {
            id: el._id,
            title: el.title,
            author: el.authors[0].username,
            comments: el.comments.map((el) => el.comment),
          };
        });
        res.send(idAndComments);
      } else {
        res.send("no comments");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//comments of a user in lyrics
usersRouter.get(
  "/lyrics/comments/:userId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      console.log("am in try---");
      const commentsLyr = await lyricsModel.find({
        "comments.userId": req.params.userId,
      });
      const lyrAuthor = await lyricsModel.find({
        userId: req.params.userId,
      });
      const lyrEditor = await lyricsModel.find({
        "editedLyrics.$.userId": req.params.userId,
      });
      if (commentsLyr) {
        console.log("am in if---");
        let idAndComments = commentsLyr.map((el) => {
          return {
            id: el._id,
            title: el.title,
            comments: el.comments.map((el) => el.comment),
          };
        });
        res.send({
          commAndID: idAndComments,
          lyrics: lyrAuthor,
          myEdits: lyrEditor.map((ele) => ele.editedLyrics).flat(),
        });
      } else {
        res.send("no comments");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//other user
usersRouter.get("/:userId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    console.log("am in try---");
    const user = await userModel
      .findById(req.params.userId)
      .populate("followers.userId")
      .populate("following.userId");
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, "User NOT found"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// change me
usersRouter.put("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { ...req.body },
      { new: true }
    );
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//me avatar
usersRouter.post(
  "/me/avatar",
  multer({ storage: cloudinaryStorage }).single("avatar"),
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const picUrl = req.file.path;
      const userToModify = await userModel.findByIdAndUpdate(
        req.user._id,
        { avatar: picUrl, $inc: { token: +50 } },
        { new: true }
      );
      if (userToModify) {
        res.send(userToModify);
      } else {
        next(createHttpError(404, "Not found!!"));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//folowing
usersRouter.post("/following/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    // const me = await userModel.findById(req.user._id);
    const userCheck = req.user.following.find(
      (user) => user.userId.toString() === req.body.userId
    );

    console.log("following---", req.user.following);
    console.log("T/F****", userCheck);

    if (!userCheck) {
      const meFollowing = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            following: { ...req.body, userId: req.body.userId },
          },
        },
        { new: true }
      );
      await userModel.findByIdAndUpdate(req.body.userId, {
        $push: {
          followers: { ...req.body, userId: req.user._id },
        },
      });
      res.send(meFollowing);
    } else {
      const meUnfollowing = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          $pull: {
            following: { userId: req.body.userId },
          },
        },
        { new: true }
      );
      await userModel.findByIdAndUpdate(req.body.userId, {
        $pull: {
          followers: { userId: req.user._id },
        },
      });
      res.send(meUnfollowing);
    }
  } catch (error) {
    next(createHttpError(404, "Something Wrong"));
    console.log(error);
  }
});
//generate a new refresh token
usersRouter.post("/refreshToken", async (req, res, next) => {
  try {
    console.log(req.body);
    const { currentRefreshToken } = req.body;
    console.log(currentRefreshToken);
    const { accessToken, refreshToken } = await refreshTokenAuth(
      currentRefreshToken
    );

    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

//logouts(session)
usersRouter.delete("/logout", jwtAuthMiddleware, async (req, res, next) => {
  try {
    req.user.refreshT = null;
    await req.user.save();
    res.send();
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
