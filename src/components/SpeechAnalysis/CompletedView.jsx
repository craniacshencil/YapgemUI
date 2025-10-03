import React, { useRef, useState } from "react";
import { formatTime } from "../SpeechRecorder/utils/timeUtils";

const AudioPlayback = ({ audioURL }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Playback
      </h4>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={togglePlayback}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Recording
            </>
          )}
        </button>
      </div>

      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}
    </div>
  );
};

const RecordingStats = ({ duration }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Duration</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatTime(duration)}
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Status</p>
        <p className="text-2xl font-bold text-green-600">Complete</p>
      </div>
    </div>
  );
};

const SuccessMessage = ({ duration }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-green-800">
          Recorded Successfully!
        </h3>
      </div>
      <p className="text-green-700">
        Your speech has been recorded for {formatTime(duration)}
      </p>
    </div>
  );
};

const TranscriptView = ({ transcript, recognitionError, isProcessing }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Transcript</h3>

      {recognitionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">
            Speech recognition error: {recognitionError}
            {recognitionError === "network" && (
              <span className="block mt-1">
                Check your internet connection or try using Chrome/Edge browser.
              </span>
            )}
            {recognitionError === "not-supported" && (
              <span className="block mt-1">
                Your browser doesn't support Speech Recognition. Please use
                Chrome or Edge.
              </span>
            )}
          </p>
        </div>
      )}

      {isProcessing ? (
        <p className="text-gray-600">Processing transcript...</p>
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap">
          {transcript || "No transcript available"}
        </p>
      )}
    </div>
  );
};
export const CompletedView = ({
  duration,
  audioURL,
  transcript,
  recognitionError,
  isProcessing,
}) => {
  return (
    <div className="space-y-6">
      <SuccessMessage duration={duration} />
      <AudioPlayback audioURL={audioURL} />
      <RecordingStats duration={duration} />
      <TranscriptView
        transcript={transcript}
        recognitionError={recognitionError}
        isProcessing={isProcessing}
      />
    </div>
  );
};
