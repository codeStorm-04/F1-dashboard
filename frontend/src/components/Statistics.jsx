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
  Tabs,
  Tab,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  // PieChart,
  // Pie,
  // Cell,
} from "recharts";
import axios from "axios";
import { constructorsData, performanceData } from "../data/f1Data";
import { useTheme } from "@mui/material/styles";
import { useFilter } from "../context/FilterContext";


const Statistics = () => {
  const theme = useTheme();
  const { season } = useFilter();
  const [driversData, setDriversData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const Driver_URL = `https://f1-dashboard-k5b8.onrender.com/api/f1/drivers/${season}`;
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTZiNTEyMTMyNDk0ZTk2M2MyODU0ZCIsImlhdCI6MTc0MzE3Mjg4MiwiZXhwIjoxNzQzNzc3NjgyfQ.jfC9HL5MpjADgwp6qDxYbL8WkwoEsl6OQAFCLEFdJAw";

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Fetch driver data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(Driver_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDriversData(response.data.data);
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
    };

    fetchData();
  }, [season]);

  // Calculate driver statistics
  const driverStats = driversData.map((driver) => {
    const totalPoints = driversData.reduce((sum, driver) => sum + driver.points, 0);
    const totalDriverWins = driversData.reduce((sum, driver) => sum + driver.wins, 0);
    const pointsProportion = ((driver.points / totalPoints) * 100).toFixed(2);

    console.log("total driver wins",totalDriverWins  )
    return {
      name: `${driver.driverId.name} ${driver.driverId.surname}`,
      points: driver.points,
      totalWins: driver.wins,
      pointsProportion,
      winRate: ((driver.wins / totalDriverWins) * 100).toFixed(2),
    };
  });

  // Calculate constructor statistics
  const constructorStats = constructorsData.map((constructor) => ({
    ...constructor,
    winRate: ((constructor.wins / 25.4) * 100).toFixed(1),
    avgPoints: (constructor.points / 25.4).toFixed(1),
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Statistics
      </Typography>

      {/* Key Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Total Points</Typography>
            <Typography variant="h3" color="primary">
              46.26K
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Total Wins</Typography>
            <Typography variant="h3" color="primary">
              655
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Total Drivers</Typography>
            <Typography variant="h3" color="primary">
              8
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Total Teams</Typography>
            <Typography variant="h3" color="primary">
              9
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for different statistics views */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Driver Statistics" />
          <Tab label="Team Statistics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Driver Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={driverStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="#E10600" name="Points" />
                  <Bar dataKey="pointsProportion" fill="#00D2BE" name="Points Proportion (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Driver Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Driver</TableCell>
                      <TableCell align="right">Points</TableCell>
                      <TableCell align="right">Win Rate (%)</TableCell>
                      <TableCell align="right">Points Proportion (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driverStats.map((driver) => (
                      <TableRow key={driver.name}>
                        <TableCell>{driver.name}</TableCell>
                        <TableCell align="right">{driver.points}</TableCell>
                        <TableCell align="right">{driver.winRate}%</TableCell>
                        <TableCell align="right">{driver.pointsProportion}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Team Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={constructorStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="#E10600" name="Points" />
                  <Bar dataKey="wins" fill="#00D2BE" name="Wins" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Team Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell align="right">Points</TableCell>
                      <TableCell align="right">Wins</TableCell>
                      <TableCell align="right">Win Rate (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {constructorStats.map((team) => (
                      <TableRow key={team.name}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell align="right">{team.points}</TableCell>
                        <TableCell align="right">{team.wins}</TableCell>
                        <TableCell align="right">{team.winRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Statistics;
