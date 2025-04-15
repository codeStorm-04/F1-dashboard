const { Queue, Worker } = require("bullmq");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require("axios");
const Redis = require("ioredis");
const WebSocket = require("ws");
const User = require("../models/User");
dotenv.config();

// Create an ioredis client
const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

client.on("error", (err) => console.log("ioredis Client Error", err));

// Helper: Convert a lap time string (e.g., "1:28.549" or "+15.499") to seconds
function convertLapTimeToSeconds(timeStr) {
  if (!timeStr) return null;
  if (timeStr.startsWith("+")) {
    return parseFloat(timeStr.replace("+", ""));
  }
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return parseFloat((minutes * 60 + seconds).toFixed(3));
  }
  return null;
}

// Generate a chart image URL for FP1 lap times
function getFP1ChartURL(fp1Results) {
  const labels = [];
  const data = [];

  if (Array.isArray(fp1Results)) {
    fp1Results.forEach((result) => {
      labels.push(result.driver.shortName);
      const seconds = convertLapTimeToSeconds(result.time);
      data.push(seconds);
    });
  }

  const chartConfig = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "FP1 Lap Time (s)",
          data,
          backgroundColor: "#E10600",
        },
      ],
    },
    options: {
      title: { display: true, text: "Top 5 FP1 Lap Times", fontSize: 18 },
      legend: { display: false },
      scales: {
        yAxes: [
          {
            ticks: { beginAtZero: false, callback: (value) => value + "s" },
          },
        ],
      },
    },
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartConfig)
  )}`;
}

// Generate a chart image URL for race positions
function getRaceChartURL(raceResults) {
  const labels = [];
  const data = [];

  if (Array.isArray(raceResults)) {
    raceResults.forEach((result) => {
      labels.push(result.driver.shortName);
      data.push(result.position);
    });
  }

  const chartConfig = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Race Position",
          data,
          backgroundColor: "#E10600",
        },
      ],
    },
    options: {
      title: { display: true, text: "Top 5 Race Finishers", fontSize: 18 },
      legend: { display: false },
      scales: {
        yAxes: [
          {
            ticks: {
              reverse: true,
              min: 1,
              max: 5,
              stepSize: 1,
              callback: (value) => `Position ${value}`,
            },
          },
        ],
      },
    },
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartConfig)
  )}`;
}

async function fetchFromRedis() {
  const data = await client.get("f1Data");
  return data ? JSON.parse(data) : null;
}

async function fetchFromWebSocket() {
  const ws = new WebSocket("ws://localhost:5000");
  return new Promise((resolve) => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      resolve(data);
      ws.close();
    };
    ws.onerror = () => resolve(null);
    ws.onopen = () => ws.send(JSON.stringify({ action: "fetchF1Data" }));
  });
}

async function fetchF1Data(type) {
  let f1Data = await fetchFromRedis();
  if (!f1Data) {
    f1Data = await fetchFromWebSocket();
    if (f1Data) {
      await client.setex("f1Data", 10, JSON.stringify(f1Data));
    } else {
      try {
        if (type === "race") {
          const [raceRes] = await Promise.all([
            axios.get(
              "https://f1connectapi.vercel.app/api/current/last/race?limit=5"
            ),
          ]);
          f1Data = {
            raceResults: raceRes.data?.races?.results || [],
            raceName: raceRes.data?.races?.raceName || "Recent Race",
            circuit: raceRes.data?.races?.circuit || {},
          };
        } else {
          const [fp1Res, nextRaceRes, lastRaceRes] = await Promise.all([
            axios.get(
              "https://f1connectapi.vercel.app/api/current/last/fp1?limit=5"
            ),
            axios.get("https://f1connectapi.vercel.app/api/current/next"),
            axios.get("https://f1connectapi.vercel.app/api/current/last"),
          ]);
          f1Data = {
            fp1Results: fp1Res.data?.races?.fp1Results || [],
            lastRace: lastRaceRes.data?.race?.[0] || {},
            nextRace: nextRaceRes.data?.race?.[0] || {},
          };
        }
        await client.setex("f1Data", 10, JSON.stringify(f1Data));
      } catch (error) {
        console.error("❌ Error fetching F1 data from API:", error.message);
        return null;
      }
    }
  }
  return f1Data;
}

// Create a queue instance
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

const newsletterQueue = new Queue("newsletter", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 1000 },
  },
});

// Create a worker to process the newsletter jobs
const newsletterWorker = new Worker(
  "newsletter",
  async (job) => {
    const { to, name, type = "weekly" } = job.data;

    try {
      // Get F1 data based on newsletter type
      const f1Data = await fetchF1Data(type);
      if (!f1Data) {
        throw new Error("Failed to fetch F1 data");
      }

      console.log("Fetched F1 Data:", f1Data); // Debug log

      let htmlContent, subject;
      if (type === "race") {
        const { raceResults, raceName, circuit } = f1Data;
        if (!raceName) {
          throw new Error("Race name is missing in the data");
        }
        const raceDrivers =
          Array.isArray(raceResults) && raceResults.length
            ? raceResults
                .map(
                  (result) =>
                    `<li><strong>#${result.position}</strong> ${result.driver.name} ${result.driver.surname} (${result.team.teamName}) – ${result.time}</li>`
                )
                .join("")
            : "<li>No race data available.</li>";
        const chartUrl = getRaceChartURL(raceResults);
        const circuitName = circuit.circuitName || "Unknown";
        const lapRecord = circuit.lapRecord || "N/A";

        subject = `🏁 F1 Race Update: ${raceName}`;
        htmlContent = `
          <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
            <h1 style="color: #ff0000; text-align: center;">🏎️ F1 Race Update – ${name}!</h1>
            <p style="font-style: italic; text-align: center;">Get the latest from the track – powered by real-time data</p>

            <h2 style="color: #ff0000;">🏁 Latest Race Results: ${raceName}</h2>
            <ul style="list-style-type: none; padding-left: 0;">${raceDrivers}</ul>

            <h2 style="color: #ff0000;">📊 Race Position Chart</h2>
            <p>Visualizing the top 5 finishers:</p>
            <img src="${chartUrl}" alt="Race Position Chart" style="width: 100%; max-width: 600px; border-radius: 5px; display: block; margin: 0 auto;" />

            <h2 style="color: #ff0000;">📍 Circuit Details</h2>
            <p><strong>Circuit:</strong> ${circuitName}<br><strong>Lap Record:</strong> ${lapRecord}</p>

            <h2 style="color: #ff0000;">🎉 Fan Spotlight</h2>
            <p>Share your race predictions and join the F1 community!<br>👉 <a href="https://yourdashboard.com/fan-predictions" style="color: #ff0000; text-decoration: none;">Predict Here</a></p>

            <hr style="margin: 20px 0; border-color: #ccc;">
            <footer style="font-size: 12px; color: #777; text-align: center;">You're receiving this because you subscribed to F1 Race Updates.<br><a href="#" style="color: #777;">Unsubscribe</a></footer>
          </div>
        `;
      } else {
        const { fp1Results, lastRace, nextRace } = f1Data;
        const fp1Drivers =
          Array.isArray(fp1Results) && fp1Results.length
            ? fp1Results
                .map(
                  (result, index) =>
                    `<li><strong>#${index + 1}</strong> ${result.driver.name} ${
                      result.driver.surname
                    } (${result.team.teamName}) – ${result.time}</li>`
                )
                .join("")
            : "<li>No FP1 data available.</li>";
        const chartUrl = getFP1ChartURL(fp1Results);
        const lastRaceName = lastRace.raceName || "Unavailable";
        const winner = lastRace.winner
          ? `${lastRace.winner.name} ${lastRace.winner.surname}`
          : "N/A";
        const fastestLap = lastRace.fast_lap
          ? lastRace.fast_lap.fast_lap
          : "N/A";
        const nextRaceName = nextRace.raceName || "TBD";
        const nextRaceLocation = nextRace.circuit?.circuitName || "Unknown";
        let daysLeft = "N/A";
        let formattedRaceDate = "N/A";
        if (
          nextRace.schedule &&
          nextRace.schedule.race &&
          nextRace.schedule.race.date
        ) {
          const raceDate = new Date(nextRace.schedule.race.date);
          const today = new Date();
          daysLeft = Math.max(
            0,
            Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24))
          );
          const day = String(raceDate.getDate()).padStart(2, "0");
          const month = String(raceDate.getMonth() + 1).padStart(2, "0");
          const year = raceDate.getFullYear();
          formattedRaceDate = `${day}-${month}-${year}`;
        }

        subject = `🏎️ F1 Insights: ${lastRaceName} Recap & ${nextRaceName} Preview`;
        htmlContent = `
          <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #f9f9f9; color: #1c1c1c;">
            <h1 style="color: #e10600;">🏁 F1 Weekly Digest – Stay in the Fast Lane, ${name}!</h1>
            <p style="font-style: italic;">Buckle up, here's your racing fix – powered by real-time data</p>

            <h2 style="color: #e10600;">🚥 FP1 Highlights (${lastRaceName})</h2>
            <ul>${fp1Drivers}</ul>

            <h2 style="color: #e10600;">🏆 Last Race Recap: ${lastRaceName}</h2>
            <p><strong>Winner:</strong> ${winner}</p>
            <p><strong>Fastest Lap:</strong> ${fastestLap}</p>

            <h2 style="color: #e10600;">📊 FP1 Lap Time Chart</h2>
            <p>Performance glimpse from FP1 session:</p>
            <img src="${chartUrl}" alt="FP1 Lap Time Chart" style="width: 100%; max-width: 600px; border-radius: 8px;" />

            <h2 style="color: #e10600;">📅 Coming Up Next: ${nextRaceName}</h2>
            <p>Location: <strong>${nextRaceLocation}</strong><br>Date: <strong>${formattedRaceDate}</strong><br>⏳ Only <strong>${daysLeft}</strong> days to go!</p>

            <h2 style="color: #e10600;">📣 Fan Zone</h2>
            <p>Vote for your <strong>Driver of the Day</strong> and join the race community!<br>👉 <a href="https://yourdashboard.com/fan-poll" style="color: #e10600; text-decoration: none;">Vote Here</a></p>

            <hr style="margin: 30px 0; border-color: #ccc;">
            <footer style="font-size: 12px; color: #888;">You're receiving this email because you subscribed to the F1 Weekly Digest.<br><a href="#" style="color: #888;">Click here</a> to unsubscribe</footer>
          </div>
        `;
      }

      // Send the email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "ghoshtanushri93@gmail.com",
          pass: process.env.GMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: "ghoshtanushri93@gmail.com",
        to,
        subject,
        html: htmlContent,
      });

      console.log(`Newsletter sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send newsletter to ${to}:`, error.message);
      throw error; // This will trigger the retry mechanism
    }
  },
  { connection }
);

// Handle worker events
newsletterWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed`);
});

newsletterWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} has failed with error ${err.message}`);
});

module.exports = newsletterQueue;
