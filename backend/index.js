const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const app = express();

// Use environment PORT from Render, fallback to 5000 locally
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("VisionVids backend is live!");
});

// D-ID video generation route
app.post("/api/generate-video", async (req, res) => {
  const { script } = req.body;

  const options = {
    method: "POST",
    url: "https://api.d-id.com/talks",
    headers: {
      Authorization: `Basic ${process.env.DID_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      script: {
        type: "text",
        input: script,
      },
      presenter_id: "amy-jcw5n8l1z",
    },
  };

  try {
    const response = await axios.request(options);
    const videoId = response.data.id;

    // Poll until video is ready
    let videoUrl = "";
    let status = "created";

    while (status !== "done") {
      await new Promise((r) => setTimeout(r, 3000));
      const check = await axios.get(`https://api.d-id.com/talks/${videoId}`, {
        headers: {
          Authorization: `Basic ${process.env.DID_API_KEY}`,
        },
      });
      status = check.data.status;
      videoUrl = check.data.result_url;
    }

    res.json({ videoUrl });
  } catch (error) {
    console.error("Error generating video:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate video" });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
