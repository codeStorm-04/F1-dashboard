import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { circuitLocations } from "../data/f1Data";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const CircuitMap = () => {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCircuit, setSelectedCircuit] = useState(null);

  useEffect(() => {
    const geocodeCircuits = async () => {
      try {
        const geocodedCircuits = await Promise.all(
          circuitLocations.map(async (circuit) => {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                `${circuit.name}, ${circuit.country}`
              )}`
            );
            const data = await response.json();

            if (data && data[0]) {
              return {
                ...circuit,
                coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
              };
            }
            return null;
          })
        );

        setCircuits(geocodedCircuits.filter(Boolean));
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch circuit locations");
        setLoading(false);
      }
    };

    geocodeCircuits();
  }, []);

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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Calculate center of the map based on all circuit locations
  const center =
    circuits.length > 0
      ? circuits
          .reduce(
            (acc, circuit) => [
              acc[0] + circuit.coordinates[0],
              acc[1] + circuit.coordinates[1],
            ],
            [0, 0]
          )
          .map((coord) => coord / circuits.length)
      : [0, 0];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        F1 Circuit Locations
      </Typography>

      <Grid container spacing={3}>
        {/* Map Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, bgcolor: "background.paper", height: "600px" }}>
            <MapContainer
              center={center}
              zoom={3}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {circuits.map((circuit) => (
                <Marker
                  key={circuit.name}
                  position={circuit.coordinates}
                  eventHandlers={{
                    click: () => setSelectedCircuit(circuit),
                  }}
                >
                  <Popup>
                    <Typography variant="subtitle1">{circuit.name}</Typography>
                    <Typography variant="body2">{circuit.country}</Typography>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Paper>
        </Grid>

        {/* Circuit Details Section */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: "background.paper",
              height: "600px",
              overflow: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Circuit Information
            </Typography>
            {selectedCircuit ? (
              <Card>
                <CardContent>
                  <Typography variant="h6">{selectedCircuit.name}</Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {selectedCircuit.country}
                  </Typography>
                  <Typography variant="body2">
                    Latitude: {selectedCircuit.coordinates[0].toFixed(4)}
                  </Typography>
                  <Typography variant="body2">
                    Longitude: {selectedCircuit.coordinates[1].toFixed(4)}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://source.unsplash.com/800x600/?${encodeURIComponent(
                    `${selectedCircuit.name} circuit`
                  )}`}
                  alt={selectedCircuit.name}
                />
                <CardContent>
                  <Button
                    variant="contained"
                    color="primary"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedCircuit.name}, ${selectedCircuit.country}`
                    )}`}
                    target="_blank"
                    fullWidth
                  >
                    View on Google Maps
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Typography color="textSecondary">
                Select a circuit on the map to view details
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CircuitMap;
