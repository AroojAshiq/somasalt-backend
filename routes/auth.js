import express from "express";
import formidable from "express-formidable"; // handle form data

const router = express.Router();

//middleware
// import { requireSignin } from "../middleware";

// controllers
import {
  //   backgroundCheck,
  //   retrieveNanoID,
  register,
  login,
  logout,
  currentUser,
  getFollowers,
  //   updateProfileWithRegistrationDetails,
  //   forgotPassword,
  //   resetPassword,
  //   updateAuthenticationDetails,
  currentSignedInUser,
  GoogleRegister,
  LoginWithGoogle,
  //   updateProfilePic,
  getUpdatedtUser,
  //   captureInformation,
  //   captureMediaUpload,
  getUserData,
  captureProfilePicture,
  captureMultiplePhotos,
  //   updateBackgroundFromFADV,
  //   backgroundCheckInitiatePayment,
  //   stripeBackgrouCheckOrderSuccess,
  //   createSubscription,
  //   captureVideos,
  //   deleteVideo,
  //   deleteAllVideos,
  //   deletePhoto,
  getUser,
  //   getAllUsers,
  //   captureInformationCityGuide,
  //   capturePartnerPreferences,
  //   updateGeolocation,
} from "../controllers/auth";

//capture information

router.post("/capture-profile-picture/:email", captureProfilePicture);
router.post("/capture-multiple-photos/:email", captureMultiplePhotos);

//profile page
router.get("/get-user-data/:email", getUserData);

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/followers/:id/:userId", getFollowers);

router.post("/get-user", getUser);
// router.get("/current-user", requireSignin, currentUser);
// router.get("/get-current-signed-in-user", requireSignin, currentSignedInUser);

// router.get("/get-updated-user", requireSignin, getUpdatedtUser);

router.post("/google-login", LoginWithGoogle);
router.post("/google-register", GoogleRegister);

module.exports = router;
