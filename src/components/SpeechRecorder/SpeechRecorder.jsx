import React, { useEffect, useState } from "react";
import useSpeechStore from "../../store/useSpeechStore";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { useRecordingTimer } from "../../hooks/useRecordingTimer";
import { RecordingView } from "./RecordingView";
import { CompletedView } from "./CompletedView";

export default function SpeechRecorder() {
  const { speakTime, countdownComplete } = useSpeechStore();
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
        <CompletedView duration={elapsed} audioURL={audioURL} />
      )}
    </div>
  );
}
