import createHttpError from "http-errors";

const adminOnly = async (req, res, next) => {
  if (req.user.role === "Editor") {
    next();
  } else {
    next(createHttpError(403, "Not authorized, tough luck."));
  }
};
export default adminOnly;
