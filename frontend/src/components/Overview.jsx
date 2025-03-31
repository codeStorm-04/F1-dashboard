// spotify-dashboard/src/components/Overview.js
import React from "react";
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
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { driversData, constructorsData, performanceData } from "../data/f1Data";
import TeamWinsPieChart from "./TeamWinsPieChart";
import QualifyingLapChart from "./QualifyingLapChart";
import { useTheme } from "@mui/material/styles";

const COLORS = [
  "#E10600",
  "#1E5BC6",
  "#00D2BE",
  "#FFF200",
  "#FF8700",
  "#469BFF",
];

const Overview = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Points</Typography>
            <Typography variant="h3" color="primary">
              46.26K
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Fastest Lap Time</Typography>
            <Typography variant="h3" color="primary">
              00:00:55
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6">Number of Races</Typography>
            <Typography variant="h3" color="primary">
              25.40K
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
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Constructor Points */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6" gutterBottom>
              Constructor Total Points
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={constructorsData}>
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

        {/* Team Wins Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <TeamWinsPieChart />
          </Paper>
        </Grid>

        {/* Driver Performance Trends */}
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

        {/* Qualifying Lap Times */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
            <QualifyingLapChart />
          </Paper>
        </Grid>
      </Grid>

      {/* Drivers Table */}
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
                  {driversData.map((driver) => (
                    <TableRow key={`${driver.name}-${driver.surname}`}>
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
