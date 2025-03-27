import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Typography, Paper, Box } from "@mui/material";
import { teamWinsData } from "../data/f1Data";

const TeamWinsPieChart = () => {
  const totalWins = teamWinsData.reduce((sum, team) => sum + team.wins, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.wins / totalWins) * 100).toFixed(1);
      return (
        <Paper sx={{ p: 1, bgcolor: "background.paper" }}>
          <Typography variant="body2">{`${data.name}: ${data.wins} wins`}</Typography>
          <Typography variant="body2">{`(${percentage}%)`}</Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Team Total Wins Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={teamWinsData}
            dataKey="wins"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, wins }) => `${name}: ${wins}`}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            style={{ outline: "none" }}
          >
            {teamWinsData.map((entry, index) => (
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
    </Box>
  );
};

export default TeamWinsPieChart;
