const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Root route for testing Render port
app.get("/", (req, res) => {
  res.send("✅ VisionVids backend is running!");
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
      presenter_id: "amy-jcw5n8l1z", // Update this if needed
    },
  };

  try {
    const response = await axios.request(options);
    const videoId = response.data.id;
    console.log("🟢 Video created:", videoId);

    // Poll until video is done
    let status = "created";
    let videoUrl = "";

    while (status !== "done") {
      await new Promise((r) => setTimeout(r, 3000));

      const poll = await axios.get(`https://api.d-id.com/talks/${videoId}`, {
        headers: {
          Authorization: `Basic ${process.env.DID_API_KEY}`,
        },
      });

      status = poll.data.status;
      videoUrl = poll.data.result_url;
    }

    res.json({ videoUrl });
  } catch (error) {
    console.error("❌ Video generation error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Video generation failed." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
