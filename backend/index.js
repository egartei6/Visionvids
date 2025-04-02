const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Use dynamic PORT for Render, fallback to 5000 locally
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Health check route for Render
app.get("/", (req, res) => {
  res.send("✅ VisionVids backend is running on Render!");
});

// Video generation endpoint
app.post("/api/generate-video", async (req, res) => {
  const { script } = req.body;

  const config = {
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
      presenter_id: "amy-jcw5n8l1z", // Replace if using another presenter
    },
  };

  try {
    const response = await axios(config);
    const videoId = response.data.id;
    console.log("🎥 Video requested:", videoId);

    // Polling logic to wait until video is ready
    let videoUrl = "";
    let status = "created";

    while (status !== "done") {
      await new Promise((res) => setTimeout(res, 3000));
      const statusRes = await axios.get(`https://api.d-id.com/talks/${videoId}`, {
        headers: {
          Authorization: `Basic ${process.env.DID_API_KEY}`,
        },
      });
      status = statusRes.data.status;
      videoUrl = statusRes.data.result_url;
    }

    res.json({ videoUrl });
  } catch (error) {
    console.error("❌ Failed to generate video:", error?.response?.data || error.message);
    res.status(500).json({ error: "Video generation failed. Please try again." });
  }
});

// ✅ Start server and bind to all network interfaces for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is listening on port ${PORT}`);
});
