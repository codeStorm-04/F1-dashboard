const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true }, // e.g., "max_verstappen"
  name: { type: String, required: true },
  surname: { type: String, required: true },
  nationality: { type: String, required: true },
  birthday: { type: String },
  number: { type: Number },
  shortName: { type: String },
  url: { type: String },
});

module.exports = mongoose.model("Driver", driverSchema);
