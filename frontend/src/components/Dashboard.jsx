import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Overview from "./Overview";
import Races from "./Races";
import Teams from "./Teams";
import Statistics from "./Statistics";

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/races" element={<Races />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/statistics" element={<Statistics />} />
    </Routes>
  );
};

export default Dashboard;
