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
  const [constructor, setConstructor] = useState("all");
  const [season, setSeason] = useState("2024");

  const value = {
    constructor,
    setConstructor,
    season,
    setSeason,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export default FilterContext;
