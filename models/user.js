import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: Object },
    email: { type: String, unique: true, required: true },
    username: { type: String },
    followers: [
      {
        followerId: String,
      },
    ],
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    sendNotifications: { type: Boolean },
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "cbw8eyrt02gwfowjhf8wefbureow"],
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    google_email_verified: { type: Boolean },
  },

  { timestaps: true }
);

export default mongoose.model("User", userSchema);
