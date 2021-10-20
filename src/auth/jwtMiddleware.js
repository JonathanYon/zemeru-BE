import userModel from "../services/users/schema.js";
import createHttpError from "http-errors";
import { verifyToken } from "./token.js";

export const jwtAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    //(!req.cookies.accessToken)
    next(createHttpError(404, "Try to Login first"));
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      // const token = req.cookies.accessToken
      console.log(token);
      const decode = await verifyToken(token);
      console.log("decode-->", decode);
      const user = await userModel.findById(decode._id);
      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(401, "Unauthorized!!!"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "Unauthorized!!"));
    }
  }
};
