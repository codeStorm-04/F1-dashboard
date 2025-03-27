import React from "react";
import { Typography, Paper } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const QualifyingLapChart = () => {
  // Convert lap times to seconds for easier comparison
  const convertTimeToSeconds = (timeStr) => {
    const [minutes, seconds, milliseconds] = timeStr.split(":").map(Number);
    return minutes * 60 + seconds + milliseconds / 1000;
  };

  // Sample data from the API response
  const data = [
    {
      name: "Max Verstappen",
      value: convertTimeToSeconds("1:29:179"),
      team: "Red Bull Racing",
      color: "#0600EF",
    },
    {
      name: "Charles Leclerc",
      value: convertTimeToSeconds("1:29:407"),
      team: "Ferrari",
      color: "#DC0000",
    },
    {
      name: "George Russell",
      value: convertTimeToSeconds("1:29:485"),
      team: "Mercedes",
      color: "#00D2BE",
    },
    {
      name: "Carlos Sainz",
      value: convertTimeToSeconds("1:29:507"),
      team: "Ferrari",
      color: "#DC0000",
    },
    {
      name: "Sergio Pérez",
      value: convertTimeToSeconds("1:29:537"),
      team: "Red Bull Racing",
      color: "#0600EF",
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const minutes = Math.floor(data.value / 60);
      const seconds = (data.value % 60).toFixed(3);
      return (
        <Paper sx={{ p: 1, bgcolor: "background.paper" }}>
          <Typography variant="body2">{data.name}</Typography>
          <Typography variant="body2">{data.team}</Typography>
          <Typography variant="body2">
            Lap Time: {minutes}:{seconds}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Top 5 Qualifying Lap Times
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            style={{ outline: "none" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ outline: "none" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default QualifyingLapChart;
