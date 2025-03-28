const axios = require("axios");
const Team = require("../models/Team");
const Driver = require("../models/Driver");
const ConstructorsChampionship = require("../models/ConstructorsChampionship");
const DriversChampionship = require("../models/DriversChampionship");
const PracticeSession = require("../models/PracticeSession");

const F1_API_BASE_URL = "https://f1api.dev/api";

const f1Controller = {
  async insertInitialData(req, res) {
    try {
      const { season } = req.body;
      if (!season) {
        return res
          .status(400)
          .json({ status: "error", message: "Season is required" });
      }
      console.log(`Fetching F1 data for season ${season}...`);

      const errors = [];

      const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await axios.get(url, { timeout: 10000 });
          } catch (error) {
            if (i === retries - 1) throw error;
            console.log(
              `Attempt ${i + 1} failed for ${url}: ${
                error.message
              }. Retrying in ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      };

      // Fetch teams data
      console.log("Fetching teams data...");
      let teamsResponse = null;
      try {
        teamsResponse = await fetchWithRetry(`${F1_API_BASE_URL}/teams`);
        console.log(
          "Teams API Response:",
          JSON.stringify(teamsResponse.data, null, 2)
        );
      } catch (apiError) {
        const errorMsg = `Teams API failed: ${apiError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }

      const teamsData = teamsResponse
        ? Array.isArray(teamsResponse.data)
          ? teamsResponse.data
          : teamsResponse.data?.teams || []
        : [];
      for (const team of teamsData) {
        try {
          await Team.findOneAndUpdate(
            { teamId: team.id },
            {
              teamId: team.id,
              teamName: team.name,
              country: team.country,
              firstAppearance: team.firstAppearance || team.firstAppareance,
              constructorsChampionships: team.constructorsChampionships || 0,
              driversChampionships: team.driversChampionships || 0,
              url: team.url,
            },
            { upsert: true, new: true }
          );
          console.log(`Team ${team.name} updated successfully`);
        } catch (teamError) {
          console.error(
            `Error updating team ${team.name || team.id}:`,
            teamError.message
          );
        }
      }

      // Fetch drivers data
      console.log("Fetching drivers data...");
      let driversResponse = null;
      try {
        driversResponse = await fetchWithRetry(`${F1_API_BASE_URL}/drivers`);
        console.log(
          "Drivers API Response:",
          JSON.stringify(driversResponse.data, null, 2)
        );
      } catch (apiError) {
        const errorMsg = `Drivers API failed: ${apiError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }

      const driversData = driversResponse
        ? Array.isArray(driversResponse.data)
          ? driversResponse.data
          : driversResponse.data?.drivers || []
        : [];
      for (const driver of driversData) {
        try {
          await Driver.findOneAndUpdate(
            { driverId: driver.id },
            {
              driverId: driver.id,
              name: driver.name,
              surname: driver.surname,
              nationality: driver.nationality,
              birthday: driver.birthday,
              number: driver.number || null,
              shortName: driver.shortName,
              url: driver.url,
            },
            { upsert: true, new: true }
          );
          console.log(
            `Driver ${driver.name} ${driver.surname} updated successfully`
          );
        } catch (driverError) {
          console.error(
            `Error updating driver ${driver.name || driver.id}:`,
            driverError.message
          );
        }
      }

      // Fetch constructors championship data
      console.log("Fetching constructors championship data...");
      let constructorsResponse = null;
      try {
        const constructorsUrl = `${F1_API_BASE_URL}/${season}/constructors-championship?limit=10&offset=0`;
        constructorsResponse = await fetchWithRetry(constructorsUrl);
        console.log(
          "Constructors Championship API Response:",
          JSON.stringify(constructorsResponse.data, null, 2)
        );
      } catch (apiError) {
        const errorMsg = `Constructors API failed: ${apiError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }

      const constructorsData = constructorsResponse
        ? constructorsResponse.data?.constructors_championship || []
        : [];
      for (const constructor of constructorsData) {
        try {
          // Ensure Team exists and get its ObjectId
          const teamDoc = await Team.findOneAndUpdate(
            { teamId: constructor.teamId },
            {
              teamId: constructor.teamId,
              teamName: constructor.team.teamName,
              country: constructor.team.country,
              firstAppearance:
                constructor.team.firstAppearance ||
                constructor.team.firstAppareance,
              constructorsChampionships:
                constructor.team.constructorsChampionships || 0,
              driversChampionships: constructor.team.driversChampionships || 0,
              url: constructor.team.url,
            },
            { upsert: true, new: true }
          );

          const constructorData = {
            classificationId: constructor.classificationId,
            teamId: teamDoc._id, // Use ObjectId instead of string
            points: constructor.points,
            position: constructor.position,
            wins: constructor.wins || 0,
            season,
          };
          console.log(
            `Saving constructor championship data for ${constructor.teamId}:`,
            constructorData
          );
          await ConstructorsChampionship.findOneAndUpdate(
            { teamId: teamDoc._id, season }, // Use ObjectId in query
            constructorData,
            { upsert: true }
          );
          console.log(
            `Constructor championship data updated for team ${constructor.teamId}`
          );
        } catch (constructorError) {
          console.error(
            `Error updating constructor ${constructor.teamId}:`,
            constructorError.message
          );
        }
      }

      // Fetch drivers championship data
      console.log("Fetching drivers championship data...");
      let driversChampionshipResponse = null;
      try {
        const driversChampionshipUrl = `${F1_API_BASE_URL}/${season}/drivers-championship?limit=10&offset=0`;
        driversChampionshipResponse = await fetchWithRetry(
          driversChampionshipUrl
        );
        console.log(
          "Drivers Championship API Response:",
          JSON.stringify(driversChampionshipResponse.data, null, 2)
        );
      } catch (apiError) {
        const errorMsg = `Drivers Championship API failed: ${apiError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }

      const driversChampionshipData = driversChampionshipResponse
        ? Array.isArray(driversChampionshipResponse.data)
          ? driversChampionshipResponse.data
          : driversChampionshipResponse.data?.drivers_championship || []
        : [];
      for (const driver of driversChampionshipData) {
        try {
          let driverDoc = await Driver.findOneAndUpdate(
            { driverId: driver.driverId },
            {
              driverId: driver.driverId,
              name: driver.driver.name,
              surname: driver.driver.surname,
              nationality: driver.driver.nationality,
              birthday: driver.driver.birthday,
              number: driver.driver.number,
              shortName: driver.driver.shortName,
              url: driver.driver.url,
            },
            { upsert: true, new: true }
          );
          let teamDoc = await Team.findOneAndUpdate(
            { teamId: driver.teamId },
            {
              teamId: driver.teamId,
              teamName: driver.team.teamName,
              country: driver.team.country,
              firstAppearance:
                driver.team.firstAppearance || driver.team.firstAppareance,
              constructorsChampionships:
                driver.team.constructorsChampionships || 0,
              driversChampionships: driver.team.driversChampionships || 0,
              url: driver.team.url,
            },
            { upsert: true, new: true }
          );
          await DriversChampionship.findOneAndUpdate(
            { driverId: driverDoc._id, season },
            {
              classificationId: driver.classificationId,
              driverId: driverDoc._id,
              teamId: teamDoc._id,
              points: Number(driver.points),
              position: Number(driver.position),
              wins: driver.wins !== null ? Number(driver.wins) : 0,
              season,
            },
            { upsert: true }
          );
          console.log(
            `Driver championship data updated for driver ${driver.driverId}`
          );
        } catch (driverChampionshipError) {
          console.error(
            `Error updating driver championship ${driver.driverId}:`,
            driverChampionshipError.message
          );
        }
      }

      // Fetch practice session data
      console.log("Fetching practice session data...");
      let practiceResponse = null;
      try {
        const practiceUrl = `${F1_API_BASE_URL}/${season}/1/fp1?limit=10`;
        console.log(practiceUrl);
        practiceResponse = await fetchWithRetry(practiceUrl);
        console.log(
          "Practice Session API Response:",
          JSON.stringify(practiceResponse.data, null, 2)
        );
      } catch (apiError) {
        const errorMsg = `Practice Session API failed: ${apiError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }

      if (
        practiceResponse &&
        practiceResponse.data.races &&
        practiceResponse.data.races.fp1Results
      ) {
        const { races } = practiceResponse.data;
        const practiceData = races.fp1Results;

        for (const practice of practiceData) {
          try {
            const driverDoc = await Driver.findOneAndUpdate(
              { driverId: practice.driverId },
              {
                driverId: practice.driver.driverId,
                name: practice.driver.name,
                surname: practice.driver.surname,
                nationality: practice.driver.nationality,
                birthday: practice.driver.birthday,
                number: practice.driver.number,
                shortName: practice.driver.shortName,
                url: practice.driver.url,
              },
              { upsert: true, new: true }
            );

            const teamDoc = await Team.findOneAndUpdate(
              { teamId: practice.teamId },
              {
                teamId: practice.team.teamId,
                teamName: practice.team.teamName,
                country: practice.team.nationality,
                firstAppearance: practice.team.firstAppareance,
                constructorsChampionships:
                  practice.team.constructorsChampionships || 0,
                driversChampionships: practice.team.driversChampionships || 0,
                url: practice.team.url,
              },
              { upsert: true, new: true }
            );

            const sessionDateTime = new Date(
              `${races.fp1Date}T${races.fp1Time}`
            );

            const practiceSessionData = {
              season,
              round: races.round,
              sessionType: "fp1",
              fp1Id: practice.fp1Id,
              driverId: driverDoc._id,
              teamId: teamDoc._id,
              time: practice.time,
              date: sessionDateTime,
              raceId: races.raceId,
              raceName: races.raceName,
              circuit: {
                circuitId: races.circuit.circuitId,
                circuitName: races.circuit.circuitName,
                country: races.circuit.country,
                city: races.circuit.city,
                circuitLength: races.circuit.circuitLength,
                lapRecord: races.circuit.lapRecord,
                firstParticipationYear: races.circuit.firstParticipationYear,
                corners: races.circuit.corners,
                fastestLapDriverId: races.circuit.fastestLapDriverId,
                fastestLapTeamId: races.circuit.fastestLapTeamId,
                fastestLapYear: races.circuit.fastestLapYear,
                url: races.circuit.url,
              },
            };
            await PracticeSession.findOneAndUpdate(
              {
                fp1Id: practice.fp1Id,
                season,
                round: races.round,
                sessionType: "fp1",
              },
              practiceSessionData,
              { upsert: true }
            );
            console.log(
              `Practice session data updated for driver ${practice.driverId}`
            );
          } catch (practiceError) {
            console.error(
              `Error updating practice session for ${practice.driverId}:`,
              practiceError.message
            );
          }
        }
      }

      if (errors.length > 0) {
        res.status(207).json({
          status: "partial success",
          message: `F1 data for season ${season} inserted with some failures`,
          errors: errors,
        });
      } else {
        res.json({
          status: "success",
          message: `F1 data for season ${season} inserted successfully`,
        });
      }
    } catch (error) {
      console.error("Error inserting F1 data:", error.message);
      res.status(500).json({
        status: "error",
        message: "Error inserting F1 data",
        error: error.message,
      });
    }
  },

  async getConstructorsChampionship(req, res) {
    try {
      const { year } = req.params;
      if (!year) {
        return res
          .status(400)
          .json({ status: "error", message: "Year is required" });
      }
      console.log(`Fetching constructors championship data for ${year}...`);

      const championshipData = await ConstructorsChampionship.find({
        season: year,
      })
        .populate({
          path: "teamId",
          model: "Team",
          select: "teamName country",
        })
        .sort({ position: 1 });

      console.log(
        `Found ${championshipData.length} constructors championship entries`
      );
      if (!championshipData.length) {
        return res.status(404).json({
          status: "error",
          message: "No constructors championship data found for this year",
        });
      }

      res.json({
        status: "success",
        data: championshipData,
      });
    } catch (error) {
      console.error("Error fetching constructors championship:", error.message);
      res.status(500).json({
        status: "error",
        message: "Error fetching constructors championship data",
        error: error.message,
      });
    }
  },

  async getDriversChampionship(req, res) {
    try {
      const { year } = req.params;
      if (!year)
        return res
          .status(400)
          .json({ status: "error", message: "Year is required" });
      const championshipData = await DriversChampionship.find({ season: year })
        .populate("driverId", "name surname nationality")
        .populate("teamId", "teamName")
        .sort({ position: 1 });
      if (!championshipData.length)
        return res
          .status(404)
          .json({
            status: "error",
            message: "No drivers championship data found",
          });
      res.json({ status: "success", data: championshipData });
    } catch (error) {
      res
        .status(500)
        .json({
          status: "error",
          message: "Error fetching drivers championship data",
          error: error.message,
        });
    }
  },

  async getPracticeSession(req, res) {
    try {
      const { year, round, session } = req.params;
      if (!year || !round || !session) {
        return res.status(400).json({
          status: "error",
          message: "Year, round, and session are required",
        });
      }
      console.log(
        `Fetching practice session data for ${year} round ${round} session ${session}...`
      );

      const sessionData = await PracticeSession.find({
        season: year,
        round,
        sessionType: session,
      })
        .populate("driverId", "name surname nationality number shortName")
        .populate("teamId", "teamName country");

      console.log(`Found ${sessionData.length} practice session entries`);
      if (!sessionData.length) {
        return res.status(404).json({
          status: "error",
          message:
            "No practice session data found for the specified parameters",
        });
      }

      res.json({
        status: "success",
        data: sessionData,
      });
    } catch (error) {
      console.error("Error fetching practice session:", error.message);
      res.status(500).json({
        status: "error",
        message: "Error fetching practice session data",
        error: error.message,
      });
    }
  },
};

module.exports = f1Controller;
