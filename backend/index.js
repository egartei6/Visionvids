const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000; // Bind to the port Render sets

app.use(express.json());
app.use(require("cors")());

// Sample route
app.get("/", (req, res) => {
  res.send("VisionVids API is running successfully...");
});

// D-ID video route
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
    console.log("Video generated:", response.data);

    let videoUrl = "";
    let status = "created";

    while (status !== "done") {
      await new Promise((r) => setTimeout(r, 3000));
      const statusCheck = await axios.get(`https://api.d-id.com/talks/${videoId}`, {
        headers: {
          Authorization: `Basic ${process.env.DID_API_KEY}`,
        },
      });
      status = statusCheck.data.status;
      videoUrl = statusCheck.data.result_url;
    }

    res.json({ videoUrl });
  } catch (error) {
    console.error("Video generation error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate video" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
