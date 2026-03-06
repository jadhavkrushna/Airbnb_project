const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    firstName: {
      type: String,
      trim: true,
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    profileImage: {
      url: {
        type: String,
        default: "https://res.cloudinary.com/demo/image/upload/d_avatar.png/personal_avatar.png"
      },
      filename: {
        type: String,
        default: "default_avatar"
      }
    }
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("User", UserSchema);
