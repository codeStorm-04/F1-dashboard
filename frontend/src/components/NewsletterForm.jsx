import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

const NewsletterForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    frequency: "",
    favoriteDriver: "",
    favoriteConstructor: "",
    eventName: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Newsletter Preferences</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email Frequency (days)"
              type="number"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Favorite Driver"
              name="favoriteDriver"
              value={formData.favoriteDriver}
              onChange={handleChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Favorite Constructor</InputLabel>
              <Select
                name="favoriteConstructor"
                value={formData.favoriteConstructor}
                onChange={handleChange}
                label="Favorite Constructor"
              >
                <MenuItem value="mercedes">Mercedes</MenuItem>
                <MenuItem value="red_bull">Red Bull</MenuItem>
                <MenuItem value="ferrari">Ferrari</MenuItem>
                <MenuItem value="mclaren">McLaren</MenuItem>
                <MenuItem value="aston_martin">Aston Martin</MenuItem>
                <MenuItem value="alpine">Alpine</MenuItem>
                <MenuItem value="williams">Williams</MenuItem>
                <MenuItem value="alphatauri">AlphaTauri</MenuItem>
                <MenuItem value="alfa_romeo">Alfa Romeo</MenuItem>
                <MenuItem value="haas">Haas</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Event Name"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewsletterForm;
