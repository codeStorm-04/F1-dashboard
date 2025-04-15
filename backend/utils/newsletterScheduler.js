const cron = require("node-cron");
const newsletterQueue = require("./newsletterQueue");
const User = require("../models/User");

// Schedule the weekly newsletter to be sent every Monday at 9:00 AM
const scheduleNewsletter = () => {
  cron.schedule("0 9 * * 1", async () => {
    try {
      // Get all users who have newsletter enabled and want F1 news
      const users = await User.find({
        newsletter: true,
        "newsletterPreferences.f1News": true,
      }).select("email name");

      if (users.length === 0) {
        console.log("No users subscribed to weekly newsletter");
        return;
      }

      // Add jobs to the queue for each subscriber
      for (const user of users) {
        await newsletterQueue.add("send-newsletter", {
          to: user.email,
          name: user.name,
        });
      }

      console.log(`Added ${users.length} weekly newsletter jobs to queue`);
    } catch (error) {
      console.error("Error scheduling weekly newsletter:", error);
    }
  });
};

// Schedule the race update newsletter to be sent daily at 10:00 AM to check for recent race data
const scheduleRaceUpdate = () => {
  cron.schedule("1 0 * * 1", async () => {
    try {
      // Get all users who have newsletter enabled and want race updates
      const users = await User.find({
        newsletter: true,
        "newsletterPreferences.raceUpdates": true,
      }).select("email name");

      if (users.length === 0) {
        console.log("No users subscribed to race updates");
        return;
      }

      // Add race update jobs to the queue for each eligible subscriber
      for (const user of users) {
        await newsletterQueue.add("send-newsletter", {
          to: user.email,
          name: user.name,
          type: "race",
        });
      }

      console.log(`Added ${users.length} race update jobs to queue`);
    } catch (error) {
      console.error("Error scheduling race update:", error);
    }
  });
};

// Helper function to generate personalized newsletter content (for weekly digest)
const generateNewsletterContent = (user) => {
  const { name, newsletterPreferences } = user;
  let content = `<h1>Hello ${name},</h1>`;
  content += "<h2>Your Weekly F1 Update</h2>";

  if (newsletterPreferences.raceUpdates) {
    content += "<h3>Latest Race Updates</h3>";
    content +=
      "<p>Stay tuned for the latest race results and highlights...</p>";
  }

  if (newsletterPreferences.driverUpdates) {
    content += "<h3>Driver News</h3>";
    content += "<p>Get the latest updates about your favorite drivers...</p>";
  }

  if (newsletterPreferences.teamUpdates) {
    content += "<h3>Team News</h3>";
    content += "<p>Latest developments from the teams...</p>";
  }

  content += "<p>Thank you for subscribing to our F1 newsletter!</p>";
  return content;
};

// Initialize both schedules
scheduleNewsletter();
scheduleRaceUpdate();

module.exports = scheduleNewsletter;
