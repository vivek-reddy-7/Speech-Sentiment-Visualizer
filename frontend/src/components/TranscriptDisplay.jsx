import React, { useEffect, useState } from "react";
import "./TranscriptDisplay.css";
import { useAutoScroll } from "../util/useAutoScroll";

export default function TranscriptDisplay({ transcript, trailingTextLength }) {
  const transcriptPanelRef = useAutoScroll(transcript);
  const [trailingKey, setTrailingKey] = useState(0);

  useEffect(() => {
    setTrailingKey((prev) => prev + 1);
  }, [transcript]);

  let transcriptMain = "",
    trailingText = "";
  if (transcript) {
    if (transcript.length > trailingTextLength) {
      transcriptMain = transcript.slice(
        0,
        transcript.length - trailingTextLength
      );
      trailingText = transcript.slice(transcript.length - trailingTextLength);
    } else {
      trailingText = transcript;
    }
  }

  return (
    <div
      className="panel transcript-panel content-panel"
      ref={transcriptPanelRef}
    >
      <h2 className="panel-title">Live Transcript</h2>
      {transcriptMain && (
        <span>{transcriptMain}</span>
      )}
      {trailingText && (
        <span key={trailingKey} className="trailing-text">
          {trailingText}
        </span>
      )}
      {!transcriptMain && !trailingText && (
        <span className="placeholder-text">
          Start speaking to see text here...
        </span>
      )}
    </div>
  );
}
