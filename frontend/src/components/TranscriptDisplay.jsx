import React from "react";
import "./TranscriptDisplay.css";
import  {useAutoScroll}  from '../util/useAutoScroll';

export default function TranscriptDisplay({ transcript }) {
  const transcriptPanelRef = useAutoScroll(transcript)

  return (
    <div className="panel transcript-panel glassy" ref={transcriptPanelRef}>
      <h2 className="panel-title">Live Transcript</h2>
      <p className="transcript-text">
        {transcript || "Start speaking to see text here..."}
      </p>
    </div>
  );
}
