import React, { useEffect, useState } from "react";
import useSpeechStore from "../../store/useSpeechStore";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useRecordingTimer } from "./hooks/useRecordingTimer";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { speechAnalysisService } from "./services/speechAnalysisService";
import { RecordingView } from "./RecordingView";
import { CompletedView } from "./CompletedView";

export default function SpeechRecorder() {
  const {
    speakTime,
    countdownComplete,
    response,
    setAnalysis,
    setIsAnalysisLoading,
  } = useSpeechStore();
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (recordingComplete && transcript) {
      const sendTranscript = async () => {
        setIsProcessing(true);
        setIsAnalysisLoading(true);
        let topic = response.topic + " " + response.bullet_points.join(" ");
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
          setIsProcessing(false);
        }
      };
      sendTranscript();
    }
  }, [recordingComplete, transcript, elapsed, speakTime]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Speech Recording
      </h2>

      {!recording && !recordingComplete && (
        <p className="text-gray-600">Waiting for countdown to finish...</p>
      )}

      {recording && (
        <RecordingView
          elapsed={elapsed}
          remaining={remaining}
          speakTime={speakTime}
          stream={stream}
        />
      )}

      {recordingComplete && (
        <div>
          <CompletedView
            duration={elapsed}
            audioURL={audioURL}
            transcript={transcript}
            recognitionError={recognitionError}
            isProcessing={isProcessing}
          />
        </div>
      )}
    </div>
  );
}
