const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emailFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    favoriteDriver: {
      type: String,
      trim: true,
    },
    favoriteConstructor: {
      type: String,
      trim: true,
    },
    eventName: {
      type: String,
      trim: true,
    },
    preferences: {
      f1News: { type: Boolean, default: false },
      raceUpdates: { type: Boolean, default: false },
      driverUpdates: { type: Boolean, default: false },
      teamUpdates: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Newsletter", newsletterSchema);
