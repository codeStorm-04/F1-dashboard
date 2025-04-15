import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { io } from "socket.io-client";

// Team colors for pie chart
const TEAM_COLORS = {
  "Red Bull Racing": "#FF1801",
  "McLaren Formula 1 Team": "#FF8000",
  "Aston Martin F1 Team": "#006F62",
  "Mercedes Formula 1 Team": "#00D2BE",
  "Scuderia Ferrari": "#DC0000",
  "RB F1 Team": "#FF5733",
  "Williams Racing": "#005AFF",
  "Alpine F1 Team": "#0090FF",
  "Haas F1 Team": "#FFFFFF",
};

// Helper function to convert time string (MM:SS.sss or +SS.sss) to milliseconds
const timeToMilliseconds = (timeStr) => {
  if (!timeStr) return 0;
  if (timeStr.startsWith("+")) {
    return parseFloat(timeStr.slice(1)) * 1000;
  }
  const [minutes, seconds] = timeStr.split(":");
  return parseInt(minutes || 0) * 60 * 1000 + parseFloat(seconds) * 1000;
};

// Helper function to get team performance data
const getTeamPerformanceData = (results, session) => {
  const teamMap = {};
  results.forEach((result) => {
    const teamName = result.team.teamName;
    const time =
      session === "qualy" ? result.q3 || result.q2 || result.q1 : result.time;
    if (
      time &&
      (!teamMap[teamName] ||
        timeToMilliseconds(time) < timeToMilliseconds(teamMap[teamName].time))
    ) {
      teamMap[teamName] = { ...result, time };
    }
  });
  return Object.values(teamMap).map((result) => ({
    team: result.team.teamName,
    time: timeToMilliseconds(result.time),
    timeStr: result.time,
  }));
};

// Helper function to get driver lap times data
const getDriverLapTimesData = (results, session) => {
  return results.map((result) => ({
    driver: result.driver.shortName,
    time: timeToMilliseconds(
      session === "qualy" ? result.q3 || result.q2 || result.q1 : result.time
    ),
    timeStr:
      session === "qualy" ? result.q3 || result.q2 || result.q1 : result.time,
  }));
};

// Helper function to get speed trap data based on session
const getSpeedTrapData = (liveData, session) => {
  // Mock logic: Adjust based on actual API data structure
  const baseSpeeds = {
    fp1: { maxSpeed: 320, fullThrottle: 45 }, // Practice: conservative
    fp2: { maxSpeed: 325, fullThrottle: 47 },
    fp3: { maxSpeed: 330, fullThrottle: 49 },
    qualy: { maxSpeed: 340, fullThrottle: 55 }, // Qualifying: aggressive
    race: { maxSpeed: 335, fullThrottle: 50 }, // Race: balanced
  };

  // If liveData includes telemetry, use it; otherwise, fall back to mock
  if (liveData?.races?.telemetry?.maxSpeed) {
    return {
      kmh: liveData.races.telemetry.maxSpeed,
      mph: (liveData.races.telemetry.maxSpeed * 0.621371).toFixed(0),
      fullThrottle: liveData.races.telemetry.fullThrottlePercentage || 50,
    };
  }

  const sessionData = baseSpeeds[session] || baseSpeeds.fp1;
  return {
    kmh: sessionData.maxSpeed,
    mph: (sessionData.maxSpeed * 0.621371).toFixed(0),
    fullThrottle: sessionData.fullThrottle,
  };
};

// Circuit image mapping
const getCircuitImage = (circuitId) => {
  return `/images/circuits/${circuitId}.svg.png`;
};

const Live = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedSession, setSelectedSession] = useState("fp1");
  const [liveData, setLiveData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [speedTrap, setSpeedTrap] = useState({
    kmh: 320,
    mph: 199,
    fullThrottle: 45,
  });

  // Check login on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isLoggedIn || !token) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Establish socket connection when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const socketInstance = io("http://localhost:5000", {
        transports: ["websocket"],
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      socketInstance.on("f1data", (data) => {
        console.log("Received data via WebSocket:", data);
        setLiveData(data);
      });

      socketInstance.on("connect", () =>
        console.log("Connected to WebSocket server")
      );
      socketInstance.on("error", (err) =>
        console.error("WebSocket error:", err)
      );

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isLoggedIn]);

  // Emit filter event and update speed trap when session changes
  useEffect(() => {
    if (socket) {
      console.log("Emitting filter event for:", selectedSession);
      socket.emit("filter", { filter: selectedSession });
    }
    // Update speed trap data based on session and liveData
    const newSpeedTrap = getSpeedTrapData(liveData, selectedSession);
    setSpeedTrap(newSpeedTrap);
  }, [selectedSession, socket, liveData]);

  // Extract results based on session type
  const currentResults = liveData
    ? selectedSession === "qualy"
      ? liveData.races?.qualyResults || []
      : selectedSession === "race"
      ? liveData.races?.results || []
      : liveData.races?.[selectedSession + "Results"] || []
    : [];

  const teamPerformanceData = getTeamPerformanceData(
    currentResults,
    selectedSession
  );
  const driverLapTimesData = getDriverLapTimesData(
    currentResults,
    selectedSession
  );

  const fastestLap =
    currentResults.length > 0
      ? currentResults.reduce((fastest, current) => {
          const time =
            selectedSession === "qualy"
              ? current.q3 || current.q2 || current.q1
              : current.time;
          return timeToMilliseconds(time) <
            timeToMilliseconds(
              fastest.time || fastest.q3 || fastest.q2 || fastest.q1
            )
            ? { ...current, time }
            : fastest;
        }, currentResults[0])
      : { driver: { shortName: "N/A" }, time: "N/A" };

  const handleSessionChange = (event) => {
    setSelectedSession(event.target.value);
    setLiveData(null);
  };

  // Get circuit image URL from liveData
  const circuitImage = liveData?.races?.circuit?.circuitId
    ? getCircuitImage(liveData.races.circuit.circuitId)
    : "/images/circuits/bahrain.svg.png";

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#1E1E1E" : "#F5F5F5",
        minHeight: "100vh",
        color: theme.palette.text.primary,
        p: 3,
      }}
    >
      {/* Session Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <FormControl
            fullWidth
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            <InputLabel sx={{ color: theme.palette.text.primary }}>
              Session
            </InputLabel>
            <Select
              value={selectedSession}
              onChange={handleSessionChange}
              sx={{ color: theme.palette.text.primary }}
            >
              <MenuItem value="fp1">Free Practice 1</MenuItem>
              <MenuItem value="fp2">Free Practice 2</MenuItem>
              <MenuItem value="fp3">Free Practice 3</MenuItem>
              <MenuItem value="qualy">Qualifying</MenuItem>
              <MenuItem value="race">Race</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Driver Lap Times Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              height: "400px",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Driver Lap Times
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={driverLapTimesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="driver"
                  stroke={theme.palette.text.primary}
                  tick={{ fill: theme.palette.text.primary }}
                />
                <YAxis
                  stroke={theme.palette.text.primary}
                  tick={{ fill: theme.palette.text.primary }}
                  domain={["dataMin - 100", "dataMax + 100"]}
                  label={{
                    value: "Time (ms)",
                    angle: -90,
                    position: "insideLeft",
                    fill: theme.palette.text.primary,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                  formatter={(value) => [`${value.toFixed(0)}ms`, "Time"]}
                />
                <Bar dataKey="time" fill="#E10600" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Team Performance Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              height: "400px",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Team Performance (Best Time)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamPerformanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="time"
                  label={({ team, timeStr, cx, cy, midAngle, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={theme.palette.text.primary}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        style={{ fontSize: "10px" }}
                      >
                        <tspan x={x} dy="-0.6em">
                          {team}
                        </tspan>
                        <tspan x={x} dy="1.2em">
                          {timeStr}
                        </tspan>
                      </text>
                    );
                  }}
                >
                  {teamPerformanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TEAM_COLORS[entry.team] || "#8884d8"}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                  formatter={(value) => [`${value.toFixed(0)}ms`, "Best Time"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top 3 Drivers Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {currentResults.slice(0, 3).map((result, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              sx={{
                p: 2,
                backgroundColor:
                  index === 0 ? "#1A1A2E" : index === 1 ? "#E05600" : "#006F62",
                backgroundImage: `linear-gradient(45deg, ${
                  index === 0
                    ? "#1A1A2E, #0C0C1D"
                    : index === 1
                    ? "#E05600, #CC4400"
                    : "#006F62, #005A4F"
                })`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">{result.driver.shortName}</Typography>
                <Typography>P{index + 1}</Typography>
                <Typography>
                  {index === 0
                    ? "Leader"
                    : `+${
                        (timeToMilliseconds(
                          selectedSession === "qualy"
                            ? result.q3 || result.q2 || result.q1
                            : result.time
                        ) -
                          timeToMilliseconds(
                            selectedSession === "qualy"
                              ? currentResults[0].q3 ||
                                  currentResults[0].q2 ||
                                  currentResults[0].q1
                              : currentResults[0].time
                          )) /
                        1000
                      }s`}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Fastest Lap Info */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body1">FASTEST LAP</Typography>
          <Typography variant="body1" sx={{ color: "#FF1801" }}>
            {fastestLap.time}
          </Typography>
          <Typography variant="body1">{fastestLap.driver.shortName}</Typography>
          <Typography variant="body1">Lap 1</Typography>
          <Typography variant="body1" sx={{ color: "#9E4BD3" }}>
            New Tyres
          </Typography>
          <Typography variant="body1" sx={{ color: "#E10600" }}>
            Tyre Age: 0 laps
          </Typography>
        </Box>
      </Paper>

      {/* Track and Speed Info */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {liveData?.races?.raceName || "Bahrain Grand Prix 2025"}
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 300,
                backgroundColor: "#1E1E1E",
                borderRadius: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={circuitImage}
                alt={liveData?.races?.circuit.circuitName || "Circuit Layout"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                onError={(e) =>
                  (e.target.src = "/images/circuits/bahrain.svg.png")
                }
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {liveData?.races?.circuit.city},{" "}
              {liveData?.races?.circuit.country || "Sakhir, Bahrain"}
            </Typography>
            <Typography variant="body2">
              {liveData?.races?.qualyDate || liveData?.races?.date || "12 APR"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="h6">Speed Trap</Typography>
              <Typography variant="h2" sx={{ color: "#E10600" }}>
                {speedTrap.kmh} km/h
              </Typography>
              <Typography variant="body1">{speedTrap.mph} mph</Typography>
              <Box
                sx={{
                  width: "200px",
                  height: "200px",
                  position: "relative",
                  mt: 2,
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={speedTrap.fullThrottle}
                  size={200}
                  thickness={4}
                  sx={{
                    color: "#00FF00",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body1">Full Throttle</Typography>
                  <Typography variant="h4">
                    {speedTrap.fullThrottle}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Session Standings */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  Position
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  Driver
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  Nationality
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {selectedSession === "qualy" ? "Q3 Time" : "Time"}
                </TableCell>
                {selectedSession === "qualy" && (
                  <>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      Q2 Time
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      Q1 Time
                    </TableCell>
                  </>
                )}
                {selectedSession === "race" && (
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    Points
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentResults.map((result, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#333333" : "#F5F5F5",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#2A2A2A" : "#FFFFFF",
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {selectedSession === "race" ? result.position : index + 1}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {result.driver.shortName}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {result.driver.nationality}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {selectedSession === "qualy"
                      ? result.q3 || result.q2 || result.q1
                      : result.time}
                  </TableCell>
                  {selectedSession === "qualy" && (
                    <>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {result.q2 || "-"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {result.q1 || "-"}
                      </TableCell>
                    </>
                  )}
                  {selectedSession === "race" && (
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {result.points}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Live;
