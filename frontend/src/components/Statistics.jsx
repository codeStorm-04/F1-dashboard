import React from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { driversData, constructorsData, performanceData } from "../data/f1Data";
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

const Statistics = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = React.useState(0);

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
          <Tab label="Performance Trends" />
          <Tab label="Race Analysis" />
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
                  <XAxis dataKey="surname" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="#E10600" name="Points" />
                  <Bar dataKey="avgPoints" fill="#00D2BE" name="Avg Points" />
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
                      <TableCell align="right">Win Rate</TableCell>
                      <TableCell align="right">Avg Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driverStats.map((driver) => (
                      <TableRow key={`${driver.name}-${driver.surname}`}>
                        <TableCell>
                          {driver.name} {driver.surname}
                        </TableCell>
                        <TableCell align="right">{driver.points}</TableCell>
                        <TableCell align="right">{driver.winRate}%</TableCell>
                        <TableCell align="right">{driver.avgPoints}</TableCell>
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
                  <Tooltip
                    formatter={(value, name) => [`${value}`, name]}
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
                      <TableCell align="right">Win Rate</TableCell>
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

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                Driver Performance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
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

export default Statistics;
