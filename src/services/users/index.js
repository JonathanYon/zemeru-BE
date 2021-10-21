import userModel from "./schema.js";
import { Router } from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import { jwtAuthentication } from "../../auth/token.js";

const usersRouter = Router();

//register
usersRouter.post("/account", async (req, res, next) => {
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
usersRouter.post("/login", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.checkCredential(email, password);
    if (user) {
      const { accessToken, refreshToken } = jwtAuthentication(user);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(404, "Invalid email or/and password"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
usersRouter.get("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});
usersRouter.put("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});
usersRouter.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default usersRouter;
