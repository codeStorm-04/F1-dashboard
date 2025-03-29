import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "../services/axiosConfig";
import { useFilter } from "../context/FilterContext";

const ConstructorPoints = () => {
  const { season } = useFilter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConstructorPoints = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/f1/constructors/${season}`);

        if (response.data.status === "success") {
          // Transform data for the bar chart
          const transformedData = response.data.data.map((item) => ({
            name: item.teamId.teamName,
            points: item.points,
            wins: item.wins,
            position: item.position,
          }));

          // Sort by points in descending order
          transformedData.sort((a, b) => b.points - a.points);
          setData(transformedData);
        }
      } catch (err) {
        console.error("Error fetching constructor points:", err);
        setError(err.response?.data?.message || "Failed to fetch constructor points");
      } finally {
        setLoading(false);
      }
    };

    fetchConstructorPoints();
  }, [season]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Constructor Championship Points {season}
      </Typography>
      <Box sx={{ height: 400, width: "100%" }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${value} points`, "Points"]}
              labelFormatter={(label) => `Team: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="points"
              name="Points"
              fill="#E10600"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ConstructorPoints; 