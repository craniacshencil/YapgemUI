import React, { useRef } from "react";
import { formatTime } from "../../utils/timeUtils";
import { useAudioVisualizer } from "../../hooks/useAudioVisualizer";

const RecordingTimer = ({ elapsed, remaining }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-center flex-1">
        <p className="text-sm text-gray-500 mb-1">Elapsed</p>
        <p className="text-3xl font-bold text-blue-600">
          {formatTime(elapsed)}
        </p>
      </div>
      <div className="text-center flex-1">
        <p className="text-sm text-gray-500 mb-1">Remaining</p>
        <p className="text-3xl font-bold text-gray-700">
          {formatTime(remaining)}
        </p>
      </div>
    </div>
  );
};

const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const Waveform = ({ stream, recording }) => {
  const canvasRef = useRef(null);
  useAudioVisualizer(canvasRef, stream, recording);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full rounded-lg"
      />
    </div>
  );
};

const RecordingIndicator = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm font-medium text-gray-700">
        Recording in progress...
      </span>
    </div>
  );
};

export const RecordingView = ({ elapsed, remaining, speakTime, stream }) => {
  return (
    <div className="space-y-6">
      <RecordingTimer elapsed={elapsed} remaining={remaining} />
      <ProgressBar current={elapsed} total={speakTime} />
      <Waveform stream={stream} recording={true} />
      <RecordingIndicator />
    </div>
  );
};
