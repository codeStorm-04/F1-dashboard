import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  LineChart,
  Line,
  // BarChart,
  // Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { constructorsData, driversData } from "../data/f1Data";
import QualifyingLapChart from "./QualifyingLapChart";
import axios from "axios";

// Mock data for races (you can replace this with real data)
const racesData = [
  {
    id: 1,
    name: "Australian Grand Prix",
    date: "2024-03-24",
    location: "Melbourne, Australia",
    circuit: "Albert Park Circuit",
    winner: "Max Verstappen",
    team: "Red Bull",
    laps: 58,
    status: "Completed",
  },
  {
    id: 2,
    name: "Saudi Arabian Grand Prix",
    date: "2024-03-09",
    location: "Jeddah, Saudi Arabia",
    circuit: "Jeddah Corniche Circuit",
    winner: "Max Verstappen",
    team: "Red Bull",
    laps: 50,
    status: "Completed",
  },
  {
    id: 3,
    name: "Bahrain Grand Prix",
    date: "2024-03-02",
    location: "Sakhir, Bahrain",
    circuit: "Bahrain International Circuit",
    winner: "Max Verstappen",
    team: "Red Bull",
    laps: 57,
    status: "Completed",
  },
];

const formatDateDDMMYYYY = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
};

const Races = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [nextRace, setNextRace] = React.useState(null);

  const fetchRace = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/f1/next-race",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const raceData = response.data?.race?.[0];

      setNextRace(raceData);
      console.log(response.data);
    } catch (err) {
      console.error("Failed to load race data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRace();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Calculate driver statistics
  const driverStats = driversData.map((driver) => ({
    ...driver,
    winRate: ((driver.points / 1000) * 100).toFixed(1),
    avgPoints: (driver.points / 25.4).toFixed(1),
  }));

  // Calculate constructor statistics
  const constructorStats = constructorsData.map((constructor) => ({
    ...constructor,
    winRate: ((constructor.wins / 25.4) * 100).toFixed(1),
    avgPoints: (constructor.points / 25.4).toFixed(1),
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Races
      </Typography>

      {/* Race Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Total Races</Typography>
            <Typography variant="h3" color="primary">
              25.40K
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Races This Season</Typography>
            <Typography variant="h3" color="primary">
              3
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Upcoming Races</Typography>
            <Typography variant="h3" color="primary">
              21
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Average Race Duration</Typography>
            <Typography variant="h3" color="primary">
              1:30:00
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for different race views */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Race Calendar" />
          <Tab label="Race Results" />
          <Tab label="Race Statistics" />
          <Tab label="Race Analysis" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
          <Typography variant="h6" gutterBottom>
            Race Calendar
          </Typography>

          {nextRace && (
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Next Upcoming Race
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Session</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>FP1</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>FP2</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>FP3</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Qualifying</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Race</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Date</strong>
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.fp1?.date
                          ? formatDateDDMMYYYY(nextRace.schedule.fp1.date)
                          : "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.fp2?.date
                          ? formatDateDDMMYYYY(nextRace.schedule.fp2.date)
                          : "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.fp3?.date
                          ? formatDateDDMMYYYY(nextRace.schedule.fp3.date)
                          : "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.qualy?.date
                          ? formatDateDDMMYYYY(nextRace.schedule.qualy.date)
                          : "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.race?.date
                          ? formatDateDDMMYYYY(nextRace.schedule.race.date)
                          : "TBD"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Time</strong>
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.fp1?.time || "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.fp2?.time || "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.fp3?.time || "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.qualy?.time || "TBD"}
                      </TableCell>
                      <TableCell align="center">
                        {nextRace.schedule?.race?.time || "TBD"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Other Info Table */}
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Race</strong>
                      </TableCell>
                      <TableCell>{nextRace.raceName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Round</strong>
                      </TableCell>
                      <TableCell>{nextRace.round}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Circuit</strong>
                      </TableCell>
                      <TableCell>
                        {nextRace.circuit?.circuitName || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Location</strong>
                      </TableCell>
                      <TableCell>
                        {nextRace.circuit?.city || "Unknown"},{" "}
                        {nextRace.circuit?.country || "Unknown"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Lap Record</strong>
                      </TableCell>
                      <TableCell>
                        {nextRace.circuit?.lapRecord || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Laps</strong>
                      </TableCell>
                      <TableCell>{nextRace.laps || "TBD"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Race Wiki</strong>
                      </TableCell>
                      <TableCell>
                        <a href={nextRace.url} target="_blank" rel="noreferrer">
                          {nextRace.url}
                        </a>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Circuit Wiki</strong>
                      </TableCell>
                      <TableCell>
                        <a
                          href={nextRace.circuit?.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {nextRace.circuit?.url}
                        </a>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Paper>
      )}

      {selectedTab === 1 && (
        <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
          <Typography variant="h6" gutterBottom>
            Latest Race Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell>Time/Gap</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {driversData.map((driver, index) => (
                  <TableRow key={`${driver.name}-${driver.surname}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {driver.name} {driver.surname}
                    </TableCell>
                    <TableCell>{driver.constructor}</TableCell>
                    <TableCell align="right">{driver.points}</TableCell>
                    <TableCell>+{index * 5}s</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Team Performance in Races
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={constructorsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#E10600"
                    name="Points"
                  />
                  <Line
                    type="monotone"
                    dataKey="wins"
                    stroke="#00D2BE"
                    name="Wins"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Race Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell align="right">Win Rate</TableCell>
                      <TableCell align="right">Avg Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {constructorsData.map((team) => (
                      <TableRow key={team.name}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell align="right">
                          {((team.wins / 25.4) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          {(team.points / 25.4).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <QualifyingLapChart />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Races;
