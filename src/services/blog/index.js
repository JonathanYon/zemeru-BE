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
      .limit(5)
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
blogsRouter.put("/:Id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user.role === "Editor") {
      const post = await blogModel.findByIdAndUpdate(req.params.Id, req.body, {
        new: true,
      });
      if (post) {
        res.send(post);
      } else {
        res.send(`blog ${req.params.Id} NOT found!!`);
      }
    } else {
      next(createHttpError(403, "Not Authorized"));
    }
  } catch (error) {
    next(createHttpError(404, `post ${req.params.Id} NOT found!!`));
  }
});
blogsRouter.delete("/:Id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user.role === "Editor") {
      const post = await blogModel.findByIdAndDelete(req.params.Id);
      if (post) {
        res.status(204).send(`Deleted!!`);
      } else {
        res.send(`${req.params.Id} NOT found!`);
      }
    } else {
      next(createHttpError(403, "Not Authorized"));
    }
  } catch (error) {
    next(error);
  }
});
//*********************************comment routes******************************** */

//post comment

blogsRouter.post("/post/:id", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const post = await blogModel.findById(req.params.id);
    if (post) {
      const postComment = await blogModel.findByIdAndUpdate(
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
blogsRouter.get(
  "/post/:id/comments",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const post = await blogModel.findById(req.params.id);
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
blogsRouter.get(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const post = await blogModel.findById(req.params.id);
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
blogsRouter.put(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      // const comments = await blogModel.findOne({
      //   comments: { $elemMatch: { userId: req.user._id } },
      // });
      // console.log("--->😍", comments);
      // if (comments) {
      const comment = await blogModel.findOneAndUpdate(
        {
          _id: req.params.id,
          "comments._id": req.params.commentId,
          "comments.$.userId": req.user._id,
        },
        {
          $set: {
            "comments.$": { ...req.body, userId: req.user._id },
            // "comments.$.comment": req.body,
          },
        },
        { new: true, runValidators: true }
      );

      if (comment) {
        res.send(comment);
      } else {
        next(
          createHttpError(404, `The Post you are looking for does NOT exist!`)
        );
      }
      // } else {
      //   res.send("Stop It, You cant!!");
      // }
    } catch (error) {
      console.log(error);
      next(createHttpError(404));
    }
  }
);
blogsRouter.delete(
  "/post/:id/comments/:commentId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const blog = await blogModel.findById(req.params.id);
      if (blog) {
        const comment = await blogModel.findOneAndUpdate(
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
        next(createHttpError(404, "Blog Not Found"));
      }
    } catch (error) {
      next(createHttpError(404, "No blog"));
    }
  }
);
export default blogsRouter;
