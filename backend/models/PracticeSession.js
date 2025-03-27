const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const practiceSessionSchema = new Schema({
  season: { type: String, required: true }, // e.g., "2024"
  round: { type: String, required: true }, // e.g., "1"
  sessionType: { type: String, required: true }, // e.g., "fp1"
  fp1Id: { type: Number, required: true }, // Unique ID for each result, e.g., 1
  driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true }, // Reference to Driver
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true }, // Reference to Team
  time: { type: String, required: true }, // Lap time as string, e.g., "1:32.869"
  date: { type: Date }, // Converted from fp1Date + fp1Time, e.g., "2024-02-29T11:30:00Z"
  raceId: { type: String, required: true }, // e.g., "bahrein_2024"
  raceName: { type: String, required: true }, // e.g., "Gulf Air Bahrain Grand Prix 2024"
  circuit: {
    circuitId: { type: String, required: true }, // e.g., "bahrain"
    circuitName: { type: String, required: true }, // e.g., "Bahrain International Circuit"
    country: { type: String, required: true }, // e.g., "Bahrain" (for geocoding)
    city: { type: String, required: true }, // e.g., "Sakhir" (for geocoding)
    circuitLength: { type: String }, // e.g., "5412km"
    lapRecord: { type: String }, // e.g., "1:31:447"
    firstParticipationYear: { type: Number }, // e.g., 2004
    corners: { type: Number }, // e.g., 15
    fastestLapDriverId: { type: String }, // e.g., "de_la_rosa"
    fastestLapTeamId: { type: String }, // e.g., "mclaren"
    fastestLapYear: { type: Number }, // e.g., 2005
    url: { type: String }, // e.g., "http://en.wikipedia.org/wiki/Bahrain_International_Circuit"
  },
});

module.exports = mongoose.model("PracticeSession", practiceSessionSchema);
