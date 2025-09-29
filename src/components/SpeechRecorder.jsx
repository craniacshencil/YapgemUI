import { useEffect, useRef, useState } from "react";
import useSpeechStore from "../store/useSpeechStore";

export default function SpeechRecorder() {
  const { speakTime, countdownComplete } = useSpeechStore();
  const [recording, setRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stream, setStream] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Timer logic
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // Auto stop when speaking time ends
  useEffect(() => {
    if (elapsed >= speakTime && recording) {
      stopRecording();
    }
  }, [elapsed, speakTime, recording]);

  // Start recording after countdown
  useEffect(() => {
    if (countdownComplete) {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownComplete]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingComplete(true);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Setup waveform after recording starts and canvas is rendered
  useEffect(() => {
    if (!recording || !canvasRef.current || !stream) return;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;
      const gap = 2;
      const totalBarWidth = barWidth + gap;
      const centerY = canvas.height / 2;
      const numBars = Math.floor(canvas.width / totalBarWidth);

      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * bufferLength);
        const value = dataArray[dataIndex] || 0;
        const barHeight = (value / 255) * (canvas.height * 0.8);
        const x = i * totalBarWidth;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(
          0,
          centerY - barHeight / 2,
          0,
          centerY + barHeight / 2,
        );
        gradient.addColorStop(0, "#3b82f6");
        gradient.addColorStop(0.5, "#2563eb");
        gradient.addColorStop(1, "#1d4ed8");

        ctx.fillStyle = gradient;

        // Draw mirrored bar (centered)
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioCtx.close();
    };
  }, [recording, stream]);

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Speech Recording
      </h2>

      {!recording && !recordingComplete && (
        <p className="text-gray-600">Waiting for countdown to finish...</p>
      )}

      {recording && (
        <div className="space-y-6">
          {/* Time Display */}
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
                {formatTime(Math.max(speakTime - elapsed, 0))}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(elapsed / speakTime) * 100}%` }}
            />
          </div>

          {/* Waveform */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={120}
              className="w-full rounded-lg"
            />
          </div>

          {/* Recording Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Recording in progress...
            </span>
          </div>
        </div>
      )}

      {recordingComplete && (
        <div className="space-y-6">
          {/* Success Message */}
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
              Your speech has been recorded for {formatTime(elapsed)}
            </p>
          </div>

          {/* Playback Controls */}
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
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
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

          {/* Recording Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatTime(elapsed)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-2xl font-bold text-green-600">Complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
