import mongoose from "mongoose";
const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    title:{
        type:String,
        trim:true,
        minlength: 3,
        maxlength: 640,
    },
    slug:{
        type:String,
        lowercase: true,
    },
    image: {
        public_id: {type:String, required:true},
        url: {type:String, required:true}
    },
    date:{type:Date},
    caption:{type:String},
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User"
    // }
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);