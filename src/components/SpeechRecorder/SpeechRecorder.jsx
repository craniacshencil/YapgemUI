import React, { useEffect, useState } from "react";
import useSpeechStore from "../../store/useSpeechStore";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useRecordingTimer } from "./hooks/useRecordingTimer";
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

  // ADD audioBlob to destructuring
  const {
    recording,
    audioURL,
    audioBlob,
    stream,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const { elapsed, remaining } = useRecordingTimer(recording, speakTime, () => {
    stopRecording();
    setRecordingComplete(true);
  });

  useEffect(() => {
    if (countdownComplete && !recording && !recordingComplete) {
      startRecording();
    }
  }, [countdownComplete, recording, recordingComplete, startRecording]);

  useEffect(() => {
    // CHANGE: Check for audioBlob instead of audioURL
    if (recordingComplete && audioBlob) {
      const timer = setTimeout(() => {
        setRecordingData({
          duration: elapsed,
          audioURL: audioURL,
        });
        setIsAnalysisLoading(true);
        let topic = response.topic + " " + response.bullet_points.join(" ");

        const sendAudio = async () => {
          try {
            // CHANGE: Pass audioBlob as first parameter
            const data = await speechAnalysisService.analyzeAudio(
              audioBlob, // <- Send the blob
              elapsed, // duration
              speakTime, // speakTime
              topic, // topic
              "small", // whisper model (optional)
            );

            // Handle Error
            if (data.detail) {
              setRecordingData({
                duration: elapsed,
                audioURL: audioURL,
                errorMessage: data.detail,
              });
            } else if (data.extras.note) {
              setRecordingData({
                duration: elapsed,
                audioURL: audioURL,
                wrongLang: "Not english",
              });
            } else {
              setAnalysis(data);
            }
          } catch (error) {
            console.error("Analysis error:", error);
          } finally {
            setIsAnalysisLoading(false);
          }
        };
        sendAudio();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    recordingComplete,
    audioBlob, // CHANGE: dependency from audioURL to audioBlob
    elapsed,
    speakTime,
    response,
    setRecordingData,
    setIsAnalysisLoading,
    setAnalysis,
  ]);

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
