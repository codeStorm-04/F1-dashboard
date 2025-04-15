const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require("axios");
const Redis = require("ioredis"); // Use ioredis instead of redis
dotenv.config();

const client = new Redis("redis://localhost:6379"); // ioredis client initialization

client.on("error", (err) => console.log("Redis Client Error", err));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ghoshtanushri93@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

function convertLapTimeToSeconds(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const minutes = parseFloat(parts[0]);
  const seconds = parseFloat(parts[1]);
  return parseFloat((minutes * 60 + seconds).toFixed(3));
}

function getChartURL(fp1Results) {
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
      title: {
        display: true,
        text: "Top 5 FP1 Lap Times",
        fontSize: 18,
      },
      legend: {
        display: false,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
              callback: function (value) {
                return value + "s";
              },
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
  const WebSocket = require("ws");
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

async function isRaceLive() {
  const liveStatus = await fetchFromWebSocket();
  return liveStatus ? liveStatus.isLive || false : false;
}

async function fetchF1Data() {
  let f1Data;
  const raceLive = await isRaceLive();

  if (raceLive) {
    f1Data = await fetchFromWebSocket();
    if (f1Data) {
      await client.setEx("f1Data", 10, JSON.stringify(f1Data)); // Invalidate after 10 seconds
    }
  } else {
    f1Data = await fetchFromRedis();
    if (!f1Data) {
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
      await client.setEx("f1Data", 10, JSON.stringify(f1Data)); // Invalidate after 10 seconds
    }
  }
  return f1Data;
}

async function sendF1Newsletter() {
  const f1Data = await fetchF1Data();
  if (!f1Data) return;

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

  const chartUrl = getChartURL(fp1Results);

  const lastRaceName = lastRace.raceName || "Unavailable";
  const winner = lastRace.winner
    ? `${lastRace.winner.name} ${lastRace.winner.surname}`
    : "N/A";
  const fastestLap = lastRace.fast_lap ? lastRace.fast_lap.fast_lap : "N/A";

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

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #f9f9f9; color: #1c1c1c;">
      <h1 style="color: #e10600;">🏁 F1 Weekly Digest – Stay in the Fast Lane</h1>
      <p style="font-style: italic;">Buckle up, here’s your racing fix – powered by real-time F1 data</p>

      <h2 style="color:#e10600;">🚥 FP1 Highlights (${lastRaceName})</h2>
      <ul>
        ${fp1Drivers}
      </ul>

      <h2 style="color:#e10600;">🏆 Last Race Recap: ${lastRaceName}</h2>
      <p><strong>Winner:</strong> ${winner}</p>
      <p><strong>Fastest Lap:</strong> ${fastestLap}</p>

      <h2 style="color:#e10600;">📊 FP1 Lap Time Chart</h2>
      <p>Performance glimpse from FP1 session:</p>
      <img src="${chartUrl}" alt="FP1 Lap Time Chart" style="width: 100%; max-width: 600px; border-radius: 8px;" />

      <p>
        Location: <strong>${nextRaceLocation}</strong><br>
        Date: <strong>${formattedRaceDate}</strong><br>
        ⏳ Only <strong>${daysLeft}</strong> days to go!
      </p>

      <h2 style="color:#e10600;">📣 Fan Zone</h2>
      <p>
        Vote for your <strong>Driver of the Day</strong> and join the race community!
        <br>
        👉 <a href="https://yourdashboard.com/fan-poll" style="color: #e10600; text-decoration: none;">Vote Here</a>
      </p>

      <hr style="margin: 30px 0; border-color: #ccc;">
      <footer style="font-size: 12px; color: #888;">
        You’re receiving this email because you subscribed to the F1 Weekly Digest.<br>
        Want to unsubscribe? <a href="#" style="color: #888;">Click here</a>
      </footer>
    </div>
  `;

  const mailOptions = {
    from: "ghoshtanushri93@gmail.com",
    to: "tanushriighosh@gmail.com",
    subject: `🏎️ F1 Insights: ${lastRaceName} Recap & ${nextRaceName} Preview`,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Failed to send:", error);
    } else {
      console.log("✅ Newsletter sent successfully:", info.response);
    }
  });
}

module.exports = { sendF1Newsletter };
