import React, { useEffect, useState } from "react";
import useSpeechStore from "../../store/useSpeechStore";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useRecordingTimer } from "./hooks/useRecordingTimer";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { speechAnalysisService } from "./services/speechAnalysisService";
import { RecordingView } from "./RecordingView";

export default function SpeechRecorder() {
  const {
    speakTime,
    countdownComplete,
    response,
    setAnalysis,
    setIsAnalysisLoading,
    setRecordingData,
  } = useSpeechStore();

  const [recordingComplete, setRecordingComplete] = useState(false);

  const { recording, audioURL, stream, startRecording, stopRecording } =
    useAudioRecorder();

  const {
    transcript,
    recognitionError,
    isRecognizing,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition();

  const { elapsed, remaining } = useRecordingTimer(recording, speakTime, () => {
    stopRecording();
    stopRecognition();
    setRecordingComplete(true);
  });

  // Start recording and speech recognition when countdown completes
  useEffect(() => {
    if (countdownComplete && !recording && !recordingComplete) {
      startRecording();
      startRecognition();
    }
  }, [
    countdownComplete,
    recording,
    recordingComplete,
    startRecording,
    startRecognition,
  ]);

  // Send transcript to backend when recording is complete
  useEffect(() => {
    if (recordingComplete && audioURL && !isRecognizing) {
      // Wait a bit for speech recognition to finalize
      const timer = setTimeout(() => {
        // Set recording data after speech recognition has stopped
        setRecordingData({
          duration: elapsed,
          audioURL: audioURL,
          transcript: transcript,
          recognitionError: recognitionError,
        });

        // If no transcript, don't try to analyze
        if (!transcript) {
          return;
        }

        setIsAnalysisLoading(true);
        let topic = response.topic + " " + response.bullet_points.join(" ");

        const sendTranscript = async () => {
          try {
            const data = await speechAnalysisService.analyzeTranscript(
              transcript,
              elapsed,
              speakTime,
              topic,
            );
            setAnalysis(data);
          } catch (error) {
            console.error("Error sending transcript:", error);
          } finally {
            setIsAnalysisLoading(false);
          }
        };

        sendTranscript();
      }, 1000); // Give speech recognition 1 second to finalize

      return () => clearTimeout(timer);
    }
  }, [
    recordingComplete,
    audioURL,
    isRecognizing,
    transcript,
    elapsed,
    speakTime,
    recognitionError,
    response,
    setRecordingData,
    setIsAnalysisLoading,
    setAnalysis,
  ]);

  // Only show recording view while actively recording
  if (!recording) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <RecordingView
        elapsed={elapsed}
        remaining={remaining}
        speakTime={speakTime}
        stream={stream}
      />
    </div>
  );
}
