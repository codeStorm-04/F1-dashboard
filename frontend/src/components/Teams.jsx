// // import React from "react";
// // import {
// //   Typography,
// //   Box,
// //   Grid,
// //   Paper,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableContainer,
// //   TableHead,
// //   TableRow,
// //   Chip,
// // } from "@mui/material";


// // import { constructorsData, driversData } from "../data/f1Data";
// // import { useFilter } from "../context/FilterContext";

// // const Teams = () => {
// //   const { season } = useFilter();
// //   const Driver_URL = `http://localhost:5000/api/f1/drivers/${season}`;
// //   // Group drivers by constructor
// //   const driversByConstructor = driversData.reduce((acc, driver) => {
// //     if (!acc[driver.constructor]) {
// //       acc[driver.constructor] = [];
// //     }
// //     acc[driver.constructor].push(driver);
// //     return acc;
// //   }, {});

// //   return (
// //     <Box>
// //       <Typography variant="h4" gutterBottom>
// //         F1 Teams
// //       </Typography>

// //       {/* Teams Overview Cards */}
// //       <Grid container spacing={3} sx={{ mb: 4 }}>
// //         {constructorsData.map((team) => (
// //           <Grid item xs={12} md={6} lg={4} key={team.name}>
// //             <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
// //               <Typography variant="h6" gutterBottom>
// //                 {team.name}
// //               </Typography>
// //               <Box sx={{ mb: 2 }}>
// //                 <Chip label={team.nationality} size="small" sx={{ mr: 1 }} />
// //                 <Chip
// //                   label={`${team.wins} Wins`}
// //                   color="primary"
// //                   size="small"
// //                   sx={{ mr: 1 }}
// //                 />
// //                 <Chip
// //                   label={`${team.points} Points`}
// //                   color="secondary"
// //                   size="small"
// //                 />
// //               </Box>

// //               {/* Team Drivers */}
// //               <Typography variant="subtitle2" gutterBottom>
// //                 Current Drivers:
// //               </Typography>
// //               <TableContainer>
// //                 <Table size="small">
// //                   <TableHead>
// //                     <TableRow>
// //                       <TableCell>Driver</TableCell>
// //                       <TableCell align="right">Points</TableCell>
// //                     </TableRow>
// //                   </TableHead>
// //                   <TableBody>
// //                     {driversByConstructor[team.name]?.map((driver) => (
// //                       <TableRow key={`${driver.name}-${driver.surname}`}>
// //                         <TableCell>
// //                           {driver.name} {driver.surname}
// //                         </TableCell>
// //                         <TableCell align="right">{driver.points}</TableCell>
// //                       </TableRow>
// //                     ))}
// //                   </TableBody>
// //                 </Table>
// //               </TableContainer>
// //             </Paper>
// //           </Grid>
// //         ))}
// //       </Grid>

// //       {/* Team Statistics Table */}
// //       <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
// //         <Typography variant="h6" gutterBottom>
// //           Team Statistics
// //         </Typography>
// //         <TableContainer>
// //           <Table>
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>Team</TableCell>
// //                 <TableCell>Nationality</TableCell>
// //                 <TableCell align="right">Total Points</TableCell>
// //                 <TableCell align="right">Total Wins</TableCell>
// //                 <TableCell align="right">Current Drivers</TableCell>
// //                 <TableCell align="right">Points per Win</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {constructorsData.map((team) => (
// //                 <TableRow key={team.name}>
// //                   <TableCell>{team.name}</TableCell>
// //                   <TableCell>{team.nationality}</TableCell>
// //                   <TableCell align="right">
// //                     {team.points.toLocaleString()}
// //                   </TableCell>
// //                   <TableCell align="right">{team.wins}</TableCell>
// //                   <TableCell align="right">
// //                     {driversByConstructor[team.name]?.length || 0}
// //                   </TableCell>
// //                   <TableCell align="right">
// //                     {(team.points / team.wins).toFixed(1)}
// //                   </TableCell>
// //                 </TableRow>
// //               ))}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>
// //     </Box>
// //   );
// // };

// // export default Teams;


// import React, { useState, useEffect } from "react";
// import {
//   Typography,
//   Box,
//   Grid,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";
// import axios from "axios";
// import { useFilter } from "../context/FilterContext";

// const Teams = () => {
//   const { season } = useFilter(); // Get season dynamically
//   const [driversByConstructor, setDriversByConstructor] = useState({});
//   const Driver_URL = `http://localhost:5000/api/f1/drivers/${season}`;
//   const token =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTZiNTEyMTMyNDk0ZTk2M2MyODU0ZCIsImlhdCI6MTc0MzE3Mjg4MiwiZXhwIjoxNzQzNzc3NjgyfQ.jfC9HL5MpjADgwp6qDxYbL8WkwoEsl6OQAFCLEFdJAw";

//   // Fetch driver data with token
//   useEffect(() => {
//     const fetchDriverData = async () => {
//       try {
//         const response = await axios.get(Driver_URL, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const driverData = response.data.data;

//         // Group drivers by constructor dynamically
//         const groupedDrivers = driverData.reduce((acc, driver) => {
//           const constructorName = driver?.teamId?.teamName || "Unknown Team";

//           // Initialize team array if not present
//           if (!acc[constructorName]) {
//             acc[constructorName] = [];
//           }

//           // Add driver to the team
//           acc[constructorName].push({
//             name: driver?.driverId?.name || "N/A",
//             surname: driver?.driverId?.surname || "N/A",
//             points: driver?.points || 0,
//           });

//           return acc;
//         }, {});

//         setDriversByConstructor(groupedDrivers);
//         console.log("Grouped Drivers:", groupedDrivers);
//       } catch (error) {
//         console.error("Error fetching driver data:", error);
//       }
//     };

//     fetchDriverData();
//   }, [season, token]);

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         F1 Teams and Drivers
//       </Typography>

//       {/* Dynamically generate cards based on teams */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {Object.keys(driversByConstructor)
//           .filter((teamName) => driversByConstructor[teamName]?.length > 0) // Only show teams with drivers
//           .map((teamName) => {
//             const drivers = driversByConstructor[teamName];

//             return (
//               <Grid item xs={12} md={6} lg={4} key={teamName}>
//                 <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
//                   <Typography variant="h6" gutterBottom>
//                     {teamName}
//                   </Typography>

//                   {/* Team Drivers */}
//                   <Typography variant="subtitle2" gutterBottom>
//                     Current Drivers:
//                   </Typography>
//                   <TableContainer>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow>
//                           <TableCell>Driver</TableCell>
//                           <TableCell align="right">Points</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {drivers.map((driver, index) => (
//                           <TableRow key={`${driver.name}-${index}`}>
//                             <TableCell>
//                               {driver.name} {driver.surname}
//                             </TableCell>
//                             <TableCell align="right">{driver.points}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 </Paper>
//               </Grid>
              
//             );
//           })}
//       </Grid>
          

//     </Box>
//   );


  
  
// };

// export default Teams;




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
} from "@mui/material";
import axios from "axios";
import { useFilter } from "../context/FilterContext";

const Teams = () => {
  const { season } = useFilter(); // Get season dynamically
  const [driversByConstructor, setDriversByConstructor] = useState({});
  const [teamStats, setTeamStats] = useState({});
  const Driver_URL = `https://f1-dashboard-k5b8.onrender.com/api/f1/drivers/${season}`;
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTZiNTEyMTMyNDk0ZTk2M2MyODU0ZCIsImlhdCI6MTc0MzE3Mjg4MiwiZXhwIjoxNzQzNzc3NjgyfQ.jfC9HL5MpjADgwp6qDxYbL8WkwoEsl6OQAFCLEFdJAw";

  // Fetch driver data with token
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.get(Driver_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const driverData = response.data.data;

        // Group drivers by constructor dynamically
        const groupedDrivers = driverData.reduce((acc, driver) => {
          const constructorName = driver?.teamId?.teamName || "Unknown Team";

          // Initialize team array if not present
          if (!acc[constructorName]) {
            acc[constructorName] = [];
          }

          // Add driver to the team
          acc[constructorName].push({
            name: driver?.driverId?.name || "N/A",
            surname: driver?.driverId?.surname || "N/A",
            points: driver?.points || 0,
          });

          return acc;
        }, {});

        setDriversByConstructor(groupedDrivers);

        // Calculate team statistics dynamically
        const calculatedStats = Object.keys(groupedDrivers).reduce(
          (acc, teamName) => {
            const drivers = groupedDrivers[teamName];
            const totalPoints = drivers.reduce(
              (sum, driver) => sum + driver.points,
              0
            );

            acc[teamName] = {
              name: teamName,
              // nationality: "Unknown", // You can fetch or hardcode this if available
              points: totalPoints,
              wins: Math.floor(totalPoints / 25), // Assuming 25 points per win
              numDrivers: drivers.length,
              pointsPerWin: totalPoints / (Math.floor(totalPoints / 25) || 1),
            };

            return acc;
          },
          {}
        );

        setTeamStats(calculatedStats);
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
    };

    fetchDriverData();
  }, [season, token]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Teams and Drivers
      </Typography>

      {/* Dynamically generate cards based on teams */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.keys(driversByConstructor)
          .filter((teamName) => driversByConstructor[teamName]?.length > 0) // Only show teams with drivers
          .map((teamName) => {
            const drivers = driversByConstructor[teamName];

            return (
              <Grid item xs={12} md={6} lg={4} key={teamName}>
                <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
                  <Typography variant="h6" gutterBottom>
                    {teamName}
                  </Typography>

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
                        {drivers.map((driver, index) => (
                          <TableRow key={`${driver.name}-${index}`}>
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
            );
          })}
      </Grid>

      {/* Team Statistics Table
      <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
        <Typography variant="h6" gutterBottom>
          Team Statistics
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                
                <TableCell align="right">Total Points</TableCell>
                <TableCell align="right">Total Wins</TableCell>
                <TableCell align="right">Current Drivers</TableCell>
                <TableCell align="right">Points per Win</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(teamStats).map((teamName) => {
                const team = teamStats[teamName];
                return (
                  <TableRow key={team.name}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.nationality}</TableCell>
                    <TableCell align="right">
                      {team.points.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">{team.wins}</TableCell>
                    <TableCell align="right">{team.numDrivers}</TableCell>
                    <TableCell align="right">
                      {team.pointsPerWin.toFixed(1)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper> */}
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
          {/* <TableCell>Nationality</TableCell> */}
          <TableCell align="right">Total Points</TableCell>
          <TableCell align="right">Total Wins</TableCell>
          <TableCell align="right">Current Drivers</TableCell>
          <TableCell align="right">Points per Win</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.keys(teamStats).map((teamName) => {
          const team = teamStats[teamName];
          return (
            <TableRow key={team.name}>
              <TableCell>{team.name}</TableCell>
              {/* <TableCell>{team.nationality}</TableCell> */}
              <TableCell align="right">
                {team.points.toLocaleString()}
              </TableCell>
              <TableCell align="right">{team.wins}</TableCell>
              <TableCell align="right">{team.numDrivers}</TableCell>
              <TableCell align="right">
                {team.pointsPerWin.toFixed(1)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

    </Box>
  );
};

export default Teams;
