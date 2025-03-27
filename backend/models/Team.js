const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamId: { type: String, required: true, unique: true }, // e.g., "red_bull"
    teamName: { type: String, required: true },
    country: { type: String, required: true },
    firstAppearance: { type: Number },
    constructorsChampionships: { type: Number, default: 0 },
    driversChampionships: { type: Number, default: 0 },
    url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
