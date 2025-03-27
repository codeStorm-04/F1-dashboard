const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const Team = require("../models/Team");
const Driver = require("../models/Driver");
const ConstructorsChampionship = require("../models/ConstructorsChampionship");
const DriversChampionship = require("../models/DriversChampionship");
const PracticeSession = require("../models/PracticeSession");

// Load environment variables
dotenv.config();

const F1_API_BASE_URL = "https://f1connectapi.vercel.app/api";

// Sample data for testing
const sampleData = {
  teams: [
    {
      id: "mercedes",
      name: "Mercedes",
      country: "Germany",
      firstAppearance: "1970",
      constructorsChampionships: 8,
      driversChampionships: 9,
      url: "https://www.mercedesamgf1.com",
    },
    {
      id: "redbull",
      name: "Red Bull Racing",
      country: "Austria",
      firstAppearance: "2005",
      constructorsChampionships: 6,
      driversChampionships: 7,
      url: "https://www.redbullracing.com",
    },
    {
      id: "ferrari",
      name: "Ferrari",
      country: "Italy",
      firstAppearance: "1950",
      constructorsChampionships: 16,
      driversChampionships: 15,
      url: "https://www.ferrari.com",
    },
  ],
  drivers: [
    {
      id: "hamilton",
      name: "Lewis",
      surname: "Hamilton",
      nationality: "British",
      birthday: "1985-01-07",
      number: "44",
      shortName: "HAM",
      url: "https://www.lewishamilton.com",
    },
    {
      id: "verstappen",
      name: "Max",
      surname: "Verstappen",
      nationality: "Dutch",
      birthday: "1997-09-30",
      number: "1",
      shortName: "VER",
      url: "https://www.maxverstappen.com",
    },
    {
      id: "leclerc",
      name: "Charles",
      surname: "Leclerc",
      nationality: "Monégasque",
      birthday: "1997-10-16",
      number: "16",
      shortName: "LEC",
      url: "https://www.charlesleclerc.com",
    },
  ],
};

async function insertSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Insert teams
    console.log("Inserting teams...");
    for (const team of sampleData.teams) {
      await Team.findOneAndUpdate(
        { teamId: team.id },
        {
          teamId: team.id,
          teamName: team.name,
          country: team.country,
          firstAppareance: team.firstAppearance,
          constructorsChampionships: team.constructorsChampionships,
          driversChampionships: team.driversChampionships,
          url: team.url,
        },
        { upsert: true, new: true }
      );
      console.log(`Team ${team.name} inserted/updated`);
    }

    // Insert drivers
    console.log("Inserting drivers...");
    for (const driver of sampleData.drivers) {
      await Driver.findOneAndUpdate(
        { driverId: driver.id },
        {
          driverId: driver.id,
          name: driver.name,
          surname: driver.surname,
          nationality: driver.nationality,
          birthday: driver.birthday,
          number: driver.number,
          shortName: driver.shortName,
          url: driver.url,
        },
        { upsert: true, new: true }
      );
      console.log(`Driver ${driver.name} ${driver.surname} inserted/updated`);
    }

    // Insert constructors championship data for 2024
    console.log("Inserting constructors championship data...");
    const constructorsData = [
      {
        teamId: "mercedes",
        classificationId: "1",
        points: 100,
        position: 1,
        wins: 5,
        season: "2024",
      },
      {
        teamId: "redbull",
        classificationId: "2",
        points: 95,
        position: 2,
        wins: 4,
        season: "2024",
      },
      {
        teamId: "ferrari",
        classificationId: "3",
        points: 85,
        position: 3,
        wins: 3,
        season: "2024",
      },
    ];

    for (const constructor of constructorsData) {
      await ConstructorsChampionship.findOneAndUpdate(
        {
          teamId: constructor.teamId,
          season: constructor.season,
        },
        constructor,
        { upsert: true }
      );
      console.log(
        `Constructor championship data inserted for team ${constructor.teamId}`
      );
    }

    // Insert drivers championship data for 2024
    console.log("Inserting drivers championship data...");
    const driversChampionshipData = [
      {
        driverId: "hamilton",
        teamId: "mercedes",
        classificationId: "1",
        points: 95,
        position: 1,
        wins: 4,
        season: "2024",
      },
      {
        driverId: "verstappen",
        teamId: "redbull",
        classificationId: "2",
        points: 90,
        position: 2,
        wins: 4,
        season: "2024",
      },
      {
        driverId: "leclerc",
        teamId: "ferrari",
        classificationId: "3",
        points: 80,
        position: 3,
        wins: 3,
        season: "2024",
      },
    ];

    for (const driver of driversChampionshipData) {
      await DriversChampionship.findOneAndUpdate(
        {
          driverId: driver.driverId,
          season: driver.season,
        },
        driver,
        { upsert: true }
      );
      console.log(
        `Driver championship data inserted for driver ${driver.driverId}`
      );
    }

    console.log("Sample data insertion completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting sample data:", error);
    process.exit(1);
  }
}

// Run the insertion
insertSampleData();
