import expressJwt from "express-jwt";

export const requireSignin = expressJwt({
  //restrict routes to only signed in users so that we can access their user information eg role
    //if valid we get back req.user._id
  getToken: (req, res) => req.cookies.token,
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});