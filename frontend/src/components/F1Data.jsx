import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import f1Service from "../services/f1Service";

const F1Data = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [round, setRound] = useState("1");
  const [session, setSession] = useState("fp1");
  const [dataType, setDataType] = useState("constructors");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insertMessage, setInsertMessage] = useState(null);

  const years = ["2024", "2023", "2022", "2021", "2020"];
  const rounds = Array.from({ length: 24 }, (_, i) => (i + 1).toString());
  const sessions = ["fp1", "fp2", "fp3"];

  useEffect(() => {
    console.log("Fetching data for:", { year, round, session, dataType });
    fetchData();
  }, [year, round, session, dataType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      console.log(`Fetching ${dataType} data for year ${year}`);
      switch (dataType) {
        case "constructors":
          response = await f1Service.getConstructorsChampionship(year);
          break;
        case "drivers":
          response = await f1Service.getDriversChampionship(year);
          break;
        case "practice":
          response = await f1Service.getPracticeSession(year, round, session);
          break;
        default:
          throw new Error("Invalid data type");
      }

      console.log("Received response:", response);
      if (response && response.status === "success") {
        setData(response.data);
        console.log(`Successfully set ${dataType} data:`, response.data);
      } else {
        throw new Error(response?.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError(err.message || "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Inserting F1 data for year ${year}`);
      const response = await f1Service.insertInitialData(year);
      console.log("Insert response:", response);
      setInsertMessage(response.message);
      // Refresh data after insertion
      await fetchData();
    } catch (err) {
      console.error("Error in handleInsertData:", err);
      setError(err.message || "Failed to insert data");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!data) return null;

    switch (dataType) {
      case "constructors":
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Wins</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.position}</TableCell>
                    <TableCell>{item.teamId?.teamName || "N/A"}</TableCell>
                    <TableCell>{item.teamId?.country || "N/A"}</TableCell>
                    <TableCell>{item.points}</TableCell>
                    <TableCell>{item.wins || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case "drivers":
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Wins</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.position}</TableCell>
                    <TableCell>
                      {`${item.driverId?.name || ""} ${
                        item.driverId?.surname || ""
                      }`}
                    </TableCell>
                    <TableCell>{item.teamId?.teamName || "N/A"}</TableCell>
                    <TableCell>{item.points}</TableCell>
                    <TableCell>{item.wins || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case "practice":
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {`${item.driverId?.name || ""} ${
                        item.driverId?.surname || ""
                      }`}
                    </TableCell>
                    <TableCell>{item.teamId?.teamName || "N/A"}</TableCell>
                    <TableCell>{item.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        F1 Data
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={dataType}
              label="Data Type"
              onChange={(e) => setDataType(e.target.value)}
            >
              <MenuItem value="constructors">
                Constructors Championship
              </MenuItem>
              <MenuItem value="drivers">Drivers Championship</MenuItem>
              <MenuItem value="practice">Practice Session</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(e.target.value)}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {dataType === "practice" && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Round</InputLabel>
                <Select
                  value={round}
                  label="Round"
                  onChange={(e) => setRound(e.target.value)}
                >
                  {rounds.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Session</InputLabel>
                <Select
                  value={session}
                  label="Session"
                  onChange={(e) => setSession(e.target.value)}
                >
                  {sessions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={handleInsertData}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        Insert F1 Data for {year}
      </Button>

      {insertMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {insertMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderTable()
      )}
    </Box>
  );
};

export default F1Data;
