// spotify-dashboard/src/context/FilterContext.js
import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [season, setSeason] = useState("2024");
  const [round, setRound] = useState("1");
  const [session, setSession] = useState("fp1");
  const [constructor, setConstructor] = useState("all");

  const value = {
    // constructor,
    // setConstructor,
    // season,
    // setSeason,

    constructor,
    setConstructor,
    season,
    setSeason,
    round,
    setRound,
    session,
    setSession,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export default FilterContext;
