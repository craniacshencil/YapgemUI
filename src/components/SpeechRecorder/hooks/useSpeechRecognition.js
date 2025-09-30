import { useEffect, useState, useRef } from "react";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const recognitionRef = useRef(null);
  const isStoppedIntentionally = useRef(false);

  // Initialize Speech Recognition once on mount
  useEffect(() => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      console.error("Speech Recognition not supported in this browser");
      setRecognitionError("not-supported");
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecognizing(true);
      isStoppedIntentionally.current = false;
      console.log("Speech recognition started");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + " ";
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);

      // Ignore aborted errors when stopped intentionally
      if (event.error === "aborted" && isStoppedIntentionally.current) {
        return;
      }

      setRecognitionError(event.error);

      // If network error, try to restart once
      if (event.error === "network" && isRecognizing) {
        console.log("Attempting to restart speech recognition...");
        setTimeout(() => {
          if (recognitionRef.current && !isStoppedIntentionally.current) {
            try {
              recognitionRef.current.start();
              setRecognitionError(null);
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsRecognizing(false);
      console.log("Speech recognition ended");

      // Only auto-restart if not stopped intentionally
      if (!isStoppedIntentionally.current) {
        console.log("Speech recognition ended unexpectedly, restarting...");
        setTimeout(() => {
          if (recognitionRef.current && !isStoppedIntentionally.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isStoppedIntentionally.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting recognition:", e);
        }
      }
    };
  }, []); // Empty dependencies - only run once

  const startRecognition = () => {
    if (recognitionRef.current && !isRecognizing) {
      setTranscript("");
      setRecognitionError(null);
      isStoppedIntentionally.current = false;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setRecognitionError(e.message);
      }
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current && isRecognizing) {
      isStoppedIntentionally.current = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
    }
  };

  return {
    transcript,
    recognitionError,
    isRecognizing,
    startRecognition,
    stopRecognition,
  };
}
