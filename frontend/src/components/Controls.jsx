import React from "react";
import "./Controls.css";

export default function Controls({ isRecording, onStart, onStop }) {
  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="controls-bar">
      <button
        className={`control-button ${isRecording ? "btn-stop" : "btn-start"}`}
        onClick={handleClick}
      >
        {isRecording ? "Stop" : "Start"}
      </button>

      <div className="mic-status">
        <span className={`mic-dot ${isRecording ? "live" : "idle"}`} />
        <span className="mic-text">{isRecording ? "Listening…" : "Idle"}</span>
      </div>
    </div>
  );
}
