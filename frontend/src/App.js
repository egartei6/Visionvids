import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [script, setScript] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoHistory, setVideoHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateVideo = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/generate-video", {
        script: script,
      });

      const newVideoUrl = response.data.videoUrl;
      setVideoUrl(newVideoUrl);
      setVideoHistory([newVideoUrl, ...videoHistory]);
    } catch (error) {
      console.error("Error generating video:", error);
      alert("Failed to generate video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Welcome to VisionVids</h1>
      <input
        type="text"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Enter your video script here"
        disabled={loading}
      />
      <button onClick={handleGenerateVideo} disabled={loading}>
        {loading ? "Generating..." : "Start Creating"}
      </button>

      {videoUrl && (
        <div className="video-container">
          <h3>Your Video:</h3>
          <video controls src={videoUrl} width="400"></video>
          <br />
          <a href={videoUrl} download target="_blank" rel="noreferrer">
            <button className="download-button">Download Video</button>
          </a>
        </div>
      )}

      {videoHistory.length > 0 && (
        <div className="history">
          <h3>Video History</h3>
          {videoHistory.map((url, index) => (
            <div key={index} className="history-item">
              <video controls src={url} width="200" />
              <br />
              <a href={url} download target="_blank" rel="noreferrer">
                <button className="download-button">Download</button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
