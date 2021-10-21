import userModel from "./schema.js";
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
usersRouter.post("/account", userValidator, async (req, res, next) => {
  try {
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      next(createHttpError(400, "Bad request"));
    } else {
      const newUser = await userModel(req.body).save();
      res.status(201).send(newUser._id);
    }
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
// usersRouter.get("/:id", async (req, res, next) => {
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
    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// change me
usersRouter.put("/me", async (req, res, next) => {
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
        { avatar: picUrl },
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

export default usersRouter;
