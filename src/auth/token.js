import jwt from "jsonwebtoken";
import userModel from "../services/users/schema.js";

//access token
const newToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN,
      { expiresIn: "4hr" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

// refresh token
const newRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.REFRESH_TOKEN,
      { expiresIn: "4hr" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );
// verify access token
export const verifyToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );

//vertify refresh token

const verifyRefreshToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.REFRESH_TOKEN, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );
// token authentication
export const jwtAuthentication = async (user) => {
  const accessToken = await newToken({ _id: user._id });
  const refreshToken = await newRefreshToken({ _id: user._id });
  user.refreshT = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};
//verify refresh token
export const refreshTokenAuth = async (refresh) => {
  try {
    const decodedRefresh = await verifyRefreshToken(refresh);
    console.log(decodedRefresh);
    const user = await userModel.findById(decodedRefresh._id);
    console.log(user);
    if (!user) throw new Error("User Not Found! R.T");
    if (user.refreshT === refresh) {
      const { accessToken, refreshToken } = await jwtAuthentication(user);
      return { accessToken, refreshToken };
    }
  } catch (error) {
    console.log(error);
  }
};
