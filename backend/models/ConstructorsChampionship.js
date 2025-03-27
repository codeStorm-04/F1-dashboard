const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const constructorsChampionshipSchema = new Schema({
  classificationId: { type: Number, required: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true }, // Expects ObjectId
  points: { type: Number, required: true },
  position: { type: Number, required: true },
  wins: { type: Number, default: 0 },
  season: { type: String, required: true },
});

module.exports = mongoose.model(
  "ConstructorsChampionship",
  constructorsChampionshipSchema
);
