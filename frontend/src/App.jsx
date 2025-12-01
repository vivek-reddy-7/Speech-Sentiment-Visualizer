import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SentimentVisualization from "./components/SentimentVisualization";
import TranscriptDisplay from "./components/TranscriptDisplay";
import KeywordsDisplay from "./components/KeywordsDisplay";
import Controls from "./components/Controls";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;
const DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen?model=nova-3";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sentimentScore, setSentimentScore] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [trailingTextLength, setTrailingTextLength] = useState(0);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const dataHandlerRef = useRef(null);

  const stopMediarecorder = () => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.error("Error stopping MediaRecorder", e);
        toast.error("Error stopping mic");
      }
    }
  };

  const stopMictracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleFinalTranscript = async (finalText) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/process_text`, {
        text: finalText,
      });

      const data = response.data;
      setSentimentScore(
        typeof data.sentimentScore === "number" ? data.sentimentScore : 0
      );

      if (Array.isArray(data.keywords)) {
        setKeywords((prev) => [...prev, ...data.keywords]);
      }
    } catch (err) {
      console.error("Error calling /process_text:", err);
      if (err.response) {
        const status = err.response.status;
        const errorMsg = err.response.data?.error || "Unknown error";

        switch (status) {
          case 400:
            toast.error("Invalid text input.");
            break;
          case 502:
            toast.error(
              "AI model returned invalid response. Please try again."
            );
            break;
          case 504:
            toast.error("AI model service timeout. Please try again.");
            break;
          case 500:
            toast.error(`Backend error: ${errorMsg}`);
            break;
          default:
            toast.error(`Server error (${status}): ${errorMsg}`);
        }
      } else if (err.request) {
        toast.error("Cannot reach backend. Check your connection.");
      } else {
        toast.error("Failed to analyze sentiment. Please try again.");
      }
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    if (!DEEPGRAM_API_KEY) {
      console.error("Missing DEEPGRAM_API_KEY.");
      return;
    }

    try {
      // Request mic access
      const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      // Create MediaRecorder for mic stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      // Open WebSocket to Deepgram
      const socket = new WebSocket(DEEPGRAM_URL, ["token", DEEPGRAM_API_KEY]);
      socketRef.current = socket;

      const dataHandler = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      dataHandlerRef.current = dataHandler;

      socket.onopen = () => {
        console.log("Deepgram WebSocket connected");
        setIsRecording(true);

        // Send audio chunks every 2000ms
        mediaRecorder.addEventListener("dataavailable", dataHandler);

        mediaRecorder.start(2000);
      };

      socket.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          const alt = data.channel?.alternatives?.[0];
          const text = (alt?.transcript || "").trim();
          const isFinal = Boolean(data.is_final);

          if (!text) return;

          if (isFinal) {
            setTranscript((prev) => {
              return (prev + " " + text).trim();
            });
            setTrailingTextLength(text.trim().length);
            handleFinalTranscript(text);
          }
        } catch (e) {
          console.error("Error parsing Deepgram message:", e);
          toast.error(`Error parsing Deepgram transcript`);
        }
      };

      socket.onerror = (event) => {
        console.error("Deepgram WebSocket error:", event);
        toast.error(`Deepgram WebSocket error. Please try again.`);
      };

      socket.onclose = (event) => {
        console.log("Deepgram WebSocket closed:", event.code, event.reason);

        if (event.code !== 1000 && isRecording) {
          toast.warning("Transcription service disconnected unexpectedly");
        }

        // clean up recorder and stream
        if (isRecording) {
          setIsRecording(false);
        }

        if (dataHandlerRef.current) {
          mediaRecorderRef.current.removeEventListener(
            "dataavailable",
            dataHandlerRef.current
          );
          dataHandlerRef.current = null;
        }

        stopMediarecorder();
        stopMictracks();
      };
    } catch (err) {
      console.error("Failed to start recording:", err);

      if (err.name === "NotAllowedError") {
        toast.error("Microphone access denied. Please allow permissions.");
      } else if (err.name === "NotFoundError") {
        toast.error("No microphone found on your device.");
      } else {
        toast.error("Failed to start recording. Please try again.");
      }

      setIsRecording(false);
      stopMictracks();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    setIsRecording(false);

    // Close WebSocket
    if (socketRef.current) {
      try {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close(1000, "Client stop");
        }
      } catch (e) {
        console.warn("Error closing WebSocket:", e);
      }
    }
  };

  return (
    <div className="app-root">
      <SentimentVisualization
        sentimentScore={sentimentScore}
        keywords={keywords}
      />

      <div className="ui-overlay">
        <TranscriptDisplay
          transcript={transcript}
          trailingTextLength={trailingTextLength}
        />
        <KeywordsDisplay keywords={keywords} />
        <Controls
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
        />
      </div>
    </div>
  );
}

export default App;
