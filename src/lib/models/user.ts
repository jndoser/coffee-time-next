import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    username: { type: String },
    photo: { type: String, require: true },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: String },
    isRejected: { type: Boolean },

    // --- Dating Profile Fields ---
    bio: { type: String, maxlength: 500 },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "prefer-not-to-say"],
    },
    lookingFor: {
      type: String,
      enum: ["friends", "dating", "coffee-buddy", "networking"],
    },
    hobbies: [{ type: String }],
    favoriteQuote: { type: String, maxlength: 200 },
    profilePhotos: [
      {
        name: { type: String },
        publicId: { type: String },
        url: { type: String },
      },
    ],
    isProfileComplete: { type: Boolean, default: false },
    isOpenToMeet: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = models?.User || model("User", UserSchema);

export default User;
