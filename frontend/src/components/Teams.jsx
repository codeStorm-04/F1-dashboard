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
  Chip,
} from "@mui/material";
import { constructorsData, driversData } from "../data/f1Data";

const Teams = () => {
  // Group drivers by constructor
  const driversByConstructor = driversData.reduce((acc, driver) => {
    if (!acc[driver.constructor]) {
      acc[driver.constructor] = [];
    }
    acc[driver.constructor].push(driver);
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Teams
      </Typography>

      {/* Teams Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {constructorsData.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.name}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                {team.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label={team.nationality} size="small" sx={{ mr: 1 }} />
                <Chip
                  label={`${team.wins} Wins`}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`${team.points} Points`}
                  color="secondary"
                  size="small"
                />
              </Box>

              {/* Team Drivers */}
              <Typography variant="subtitle2" gutterBottom>
                Current Drivers:
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Driver</TableCell>
                      <TableCell align="right">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driversByConstructor[team.name]?.map((driver) => (
                      <TableRow key={`${driver.name}-${driver.surname}`}>
                        <TableCell>
                          {driver.name} {driver.surname}
                        </TableCell>
                        <TableCell align="right">{driver.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Team Statistics Table */}
      <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
        <Typography variant="h6" gutterBottom>
          Team Statistics
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Nationality</TableCell>
                <TableCell align="right">Total Points</TableCell>
                <TableCell align="right">Total Wins</TableCell>
                <TableCell align="right">Current Drivers</TableCell>
                <TableCell align="right">Points per Win</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {constructorsData.map((team) => (
                <TableRow key={team.name}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.nationality}</TableCell>
                  <TableCell align="right">
                    {team.points.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{team.wins}</TableCell>
                  <TableCell align="right">
                    {driversByConstructor[team.name]?.length || 0}
                  </TableCell>
                  <TableCell align="right">
                    {(team.points / team.wins).toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Teams;
