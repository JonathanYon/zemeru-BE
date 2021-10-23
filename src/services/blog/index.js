import { Router } from "express";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";
import { jwtAuthMiddleware } from "../../auth/jwtMiddleware.js";
import blogModel from "./schema.js";

const blogsRouter = Router();

blogsRouter.post("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.body);
    if (req.user.role === "Editor") {
      const post = await blogModel(req.body);
      const { _id } = await post.save();
      res.status(201).send({ _id });
    } else {
      next(createHttpError(403, "Not Authorized"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default blogsRouter;
