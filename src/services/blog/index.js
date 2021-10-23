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
blogsRouter.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    console.log(query);

    const total = await blogModel.countDocuments(query.criteria); //will have to finsish the query when i get the posts
    const posts = await blogModel
      .find(query.criteria, query.options.fields)
      .sort()
      .skip()
      .limit(3)
      .populate("authors");
    res.send(posts);
  } catch (error) {
    next(error);
  }
});
blogsRouter.get("/:Id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const post = await blogModel.findById(req.params.Id);
    if (post) {
      res.send(post);
    } else {
      res.send(`blog ${req.params.Id} NOT found!!`);
    }
  } catch (error) {
    next(createHttpError(404, `post ${req.params.Id} NOT found!!`));
  }
});

export default blogsRouter;
