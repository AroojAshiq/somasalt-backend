import jwt from "jsonwebtoken";
import User from "../models/user";
import Image from "../models/image";
// import Video from '../models/video';
// import BackgroundCheckOrder from "../models/backgroundcheckOrder";
import { hashPassword, comparePasssword } from "../utils/auth";
import UsernameGenerator from "username-generator";
import axios from "axios";
import { sendEmail } from "../utils/email";
import { nanoid } from "nanoid";

const cloudinary = require("../utils/cloudinary");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//@description     update user with registration details
//@route           POST /register

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password)
    const username = UsernameGenerator.generateUsername();

    //validation
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required, and should be at least 6 characters long");
    }

    let userExists = await User.findOne({ email }).exec();
    if (userExists) {
      return res.status(400).send("Please log in");
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    //create stripe accont for each user
    const customer = await stripe.customers.create({ email });
    const subscription = await stripe.customers.create({ email });

    // let newData = { email, username, password: hashedPassword, stripeCustomerId:customer.id}
    //update
    // if(userExists){
    //     const user = await User.findOneAndUpdate({email}, newData, {new:true}).exec()
    //     await user.save() //added and not sure
    //     return res.json(user)
    // }else{
    //     res.status(400).send('You need to go through a background check before applying to join the platform')
    // }
    const user = new User({
      email,
      username,
      password: hashedPassword,
      stripeBackgroundCheckCustomerId: customer.id,
      stripeSubscriptionCustomerId: subscription.id,
    });
    await user.save();
    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error, try again");
  }
};
//@description     update user with google details
//@route           POST /google-register
export const GoogleRegister = async (req, res) => {
  try {
    const { name, email, password, picture, email_verified } = req.body;
    // console.log(name, email, password, picture, email_verified)
    const username = UsernameGenerator.generateUsername();

    //validation
    if (!name) {
      return res.status(400).send("Name is required");
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required, and should be at least 6 characters long");
    }

    let userExists = await User.findOne({ email }).exec();

    // hash password
    const hashedPassword = await hashPassword(password);
    //create stripe accont for each user
    const customer = await stripe.customers.create({ email });
    const subscription = await stripe.customers.create({ email });

    let newData = {
      name,
      email,
      username,
      password: hashedPassword,
      image: picture,
      google_email_verified: email_verified,
      stripeBackgroundCheckCustomerId: customer.id,
      stripeSubscriptionCustomerId: subscription.id,
    };
    //update
    if (userExists) {
      const user = await User.findOneAndUpdate({ email }, newData, {
        new: true,
      }).exec();
      await user.save(); //added and not sure
      return res.json(user);
    } else {
      res
        .status(400)
        .send(
          "You need to go through a background check before applying to join the platform"
        );
    }
    // //register
    // const user =  new User ({
    //     name, email, username, password: hashedPassword, image:picture, google_email_verified:email_verified, stripeCustomerId:customer.id
    // })
    // await user.save()
    // return res.json(user)
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error, try again");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    //check if user exists with email
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res
        .status(400)
        .send(
          "You are not registered with those credentials. Try again or register yourself."
        );
    }
    //compare passwords with db password
    const match = await comparePasssword(password, user.password);
    if (!match) return res.status(400).send("Wrong password");
    //create jwt
    if (remember === true) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      //return user, token to client without hashed pwd
      user.password = undefined;

      //send token in cookie with only http
      res.cookie("token", token, { httpOnly: true }); //add secure:true when using https
      //send user as json
      res.json(user);
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "8640000000",
      }); //24hrs in ms
      //return user, token to client without hashed pwd
      user.password = undefined;

      //send token in cookie with only http
      res.cookie("token", token, { httpOnly: true }); //add secure:true when using https
      //send user as json
      res.json(user);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Correct your details and try again");
  }
};

export const LoginWithGoogle = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    // console.log(email, password, remember)
    //check if user exists with email
    const user = await User.findOne({ email }).exec();
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .send(
          "You are not registered with those credentials. Try again or register yourself."
        );
    }
    //compare passwords with db password
    // const match = await comparePasssword(password, user.password)
    // if(!match) return res.status(400).send("Wrong password")
    //create jwt
    if (remember === true) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      //return user, token to client without hashed pwd
      user.password = undefined;

      //send token in cookie with only http
      res.cookie("token", token, { httpOnly: true }); //add secure:true when using https
      //send user as json
      console.log(user);
      res.json(user);
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "10800000",
      }); //3hrs in ms
      //return user, token to client without hashed pwd
      user.password = undefined;

      //send token in cookie with only http
      res.cookie("token", token, { httpOnly: true }); //add secure:true when using https
      //send user as json
      res.json(user);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Correct your details and try again");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json("Signout successful.");
  } catch (err) {
    console.log(err);
  }
};

export const captureProfilePicture = async (req, res) => {
  try {
    const { image } = req.body;
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "userProfilePictures",
    });

    const updateUser = await User.findOneAndUpdate(
      { email: req.params.email },
      {
        profilePicture: uploadedImage,
      },
      {
        new: true,
      }
    );

    await updateUser.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};

export const captureMultiplePhotos = async (req, res) => {
  try {
    const { image } = req.body;
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "userImages",
    });

    const newImage = new Image({
      image: uploadedImage,
    });

    await newImage.save();

    const foundUser = await User.findOneAndUpdate(
      { email: req.params.email },
      {
        $push: {
          images: newImage._id,
        },
      },
      { new: true }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};

export const getUser = async (req, res) => {
  try {
    const { email } = req.body;

    let userExists = await User.findOne({ email }).exec();
    if (userExists) {
      return res.json({ action: "login" });
    }

    if (!userExists) {
      return res.json({ action: "register" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error, try again");
  }
};

export const getUserData = async (req, res) => {
  try {
    // const email = req.body;
    const userData = await User.findOne({ email: req.params.email })
      .populate("images videos")
      .select("-password")
      .exec();
    return res.json(userData);
  } catch (err) {
    console.log(err);
    return res.json({ userData: undefined });
  }
};

export const getUpdatedtUser = async (req, res) => {
  // console.log(req.cookies)
  try {
    const user = await User.findById(req.user._id).select("-password").exec();

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.json({ user: "None" });
  }
};

export const currentUser = async (req, res) => {
  // console.log(req.cookies)
  try {
    const user = await User.findById(req.user._id).select("-password").exec();

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.json({ user: "None" });
  }
};

export const currentSignedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    if (user) {
      return res.json({ ok: true });
    } else {
      return res.json({ ok: false });
    }
  } catch (err) {
    console.log(err);
    return res.json({ user: "None" });
  }
};

export const getFollowers = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: id,
        followers: { $not: { $elemMatch: { followerId: userId } } },
      },
      { $push: { followers: { followerId: userId } } },
      { new: true }
    ).exec();

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.json({ message: "Something went wrong" });
  }
};
