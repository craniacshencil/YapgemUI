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

  const { recording, audioURL, stream, startRecording, stopRecording } =
    useAudioRecorder();

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
    if (recordingComplete && audioURL) {
      const timer = setTimeout(() => {
        setRecordingData({
          duration: elapsed,
          audioURL: audioURL,
        });

        setIsAnalysisLoading(true);
        let topic = response.topic + " " + response.bullet_points.join(" ");

        const sendAudio = async () => {
          try {
            const data = await speechAnalysisService.analyzeAudio(
              elapsed,
              speakTime,
              topic,
            );
            setAnalysis(data);
          } catch (error) {
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
    audioURL,
    elapsed,
    speakTime,
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
