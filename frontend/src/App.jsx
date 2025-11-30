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

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const handleFinalTranscript = async (finalText) => {

    try {
      const response = await axios.post(`${BACKEND_URL}/process_text`, {
        text: finalText
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
      toast.error(`Error while parsing sentiment`);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    if (!DEEPGRAM_API_KEY) {
      console.error(
        "Missing DEEPGRAM_API_KEY."
      );
      return;
    }

    try {
      // Request mic access
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder for mic stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm"
      });
      mediaRecorderRef.current = mediaRecorder;

      // Open WebSocket to Deepgram
      const socket = new WebSocket(DEEPGRAM_URL, [
        "token",
        DEEPGRAM_API_KEY
      ]);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Deepgram WebSocket connected");
        setIsRecording(true);

        // Send audio chunks every 250ms
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (
            event.data.size > 0 &&
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send(event.data);
          }
        });

        mediaRecorder.start(250);
      };

      socket.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          const alt = data.channel?.alternatives?.[0];
          const text = (alt?.transcript || "").trim();
          const isFinal = Boolean(data.is_final);

          if (!text) return;

          setTranscript((prev) => {
            // console.log(prev,text, "111")
            return (prev + " " + text).trim()
          });

          if (isFinal) {
            // console.log(text, 'final text')
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
        // Ensure recording state and media are cleaned up
        setIsRecording(false);
        if (mediaRecorderRef.current) {
          try {
            if (mediaRecorderRef.current.state !== "inactive") {
              mediaRecorderRef.current.stop();
            }
          } catch (e) {
            toast.error("Error stopping mic");
          }
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Failed to start recording");
      
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    setIsRecording(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.warn("Error stopping MediaRecorder:", e);
      }
    }

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

    // Stop mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="app-root">
      <SentimentVisualization
        sentimentScore={sentimentScore}
        keywords={keywords}
      />

      <div className="ui-overlay">
        <TranscriptDisplay transcript={transcript} />
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
