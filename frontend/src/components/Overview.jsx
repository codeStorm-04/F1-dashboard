import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import QualifyingLapChart from "./QualifyingLapChart";
import { constructorsData, performanceData } from "../data/f1Data";
import { useFilter } from "../context/FilterContext";

// Chart Colors
const COLORS = [
  "#E10600", // Ferrari Red
  "#1E5BC6", // Williams Blue
  "#00D2BE", // Mercedes Teal
  "#FFF200", // Renault Yellow
  "#FF8700", // McLaren Orange
  "#469BFF", // Alpine Blue
];

const Overview = () => {
  const theme = useTheme();
  const { season } = useFilter();
  const [constructorData, setConstructorData] = useState([]);
  const [topWinsData, setTopWinsData] = useState([]);
  const [driverData, setDriverData] = useState([]);

  
  const API_URL = `https://f1-dashboard-k5b8.onrender.com/api/f1/constructors/${season}`;
  const Driver_URL = `https://f1-dashboard-k5b8.onrender.com/api/f1/drivers/${season}`;
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTZiNTEyMTMyNDk0ZTk2M2MyODU0ZCIsImlhdCI6MTc0MzE3Mjg4MiwiZXhwIjoxNzQzNzc3NjgyfQ.jfC9HL5MpjADgwp6qDxYbL8WkwoEsl6OQAFCLEFdJAw";

  // Fetch constructor data
  useEffect(() => {
    const fetchConstructorData = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedData = response.data.data.map((item) => ({
          name: item.teamId.teamName,
          points: item.points,
          wins: item.wins,
        }));

        setConstructorData(formattedData);

        // Get top 5 teams by wins for PieChart
        const top5WinsData = [...formattedData]
          .filter((item) => item.wins > 0)
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 5)
          .map((item) => ({
            name: item.name,
            value: item.wins,
          }));

        setTopWinsData(top5WinsData);
      } catch (error) {
        console.error("Error fetching constructor data:", error);
      }
    };

    const fetchDriverData = async () => {
      try {
        const response = await axios.get(Driver_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedDriverData = response.data.data.map((item) => ({
          name: item.driverId.name,
          surname: item.driverId.surname,
          nationality: item.driverId.nationality,
          points: item.points,
          constructor: item.teamId.teamName,
        }));

        setDriverData(formattedDriverData);
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
    };

    fetchConstructorData();
    fetchDriverData();
  }, [season]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Points", value: "46.26K" },
          { title: "Fastest Lap Time", value: "00:00:55" },
          { title: "Number of Races", value: "25.40K" },
          { title: "Total Wins", value: "655" },
        ].map((item, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="h3" color="primary">
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Constructor Points BarChart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6" gutterBottom>
              Constructor Total Points
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={constructorData.length ? constructorData : constructorsData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}`, "Points"]}
                  labelFormatter={(label) => `Constructor: ${label}`}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "4px",
                    boxShadow: theme.shadows[3],
                  }}
                  itemStyle={{
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                  }}
                  labelStyle={{
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                />
                <Legend />
                <Bar dataKey="points" fill="#E10600" name="Points" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top 5 Constructor Wins PieChart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Constructor Wins
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topWinsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {topWinsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Driver Performance Trends Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6" gutterBottom>
              Driver Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" categories={performanceData.years} />
                <YAxis />
                <Tooltip />
                <Legend />
                {performanceData.data.map((driver, index) => (
                  <Line
                    key={driver.name}
                    type="monotone"
                    data={driver.data.map((value, i) => ({
                      year: performanceData.years[i],
                      value,
                    }))}
                    dataKey="value"
                    name={driver.name}
                    stroke={COLORS[index % COLORS.length]}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Qualifying Lap Times Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <QualifyingLapChart />
          </Paper>
        </Grid>
      </Grid>

      {/* Drivers Standings Table */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6" gutterBottom>
              Driver Standings
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Surname</TableCell>
                    <TableCell>Nationality</TableCell>
                    <TableCell align="right">Points</TableCell>
                    <TableCell>Constructor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {driverData.map((driver, index) => (
                    <TableRow key={`${driver.name}-${driver.surname}-${index}`}>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>{driver.surname}</TableCell>
                      <TableCell>{driver.nationality}</TableCell>
                      <TableCell align="right">{driver.points}</TableCell>
                      <TableCell>{driver.constructor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
