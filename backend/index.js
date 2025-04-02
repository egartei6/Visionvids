const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Use dynamic port for Render or fallback to 5000 locally
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// ✅ Health check route (Render pings this to see if the app is running)
app.get("/", (req, res) => {
  res.send("✅ VisionVids backend is running on Render!");
});

// ✅ D-ID API: Generate video from script
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
      presenter_id: "amy-jcw5n8l1z", // You can change to another D-ID presenter
    },
  };

  try {
    const response = await axios(config);
    const videoId = response.data.id;
    console.log("🎥 Video started with ID:", videoId);

    // Polling until video is ready
    let status = "created";
    let videoUrl = "";

    while (status !== "done") {
      await new Promise((res) => setTimeout(res, 3000));
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
    console.error("❌ Video generation failed:", error?.response?.data || error.message);
    res.status(500).json({ error: "Video generation failed. Try again." });
  }
});

// ✅ Start server — must bind to 0.0.0.0 for Render to detect the port
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
