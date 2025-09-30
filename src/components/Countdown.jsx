import { useState, useEffect } from "react";

// Countdown component
function Countdown({ seconds, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds); // Reset countdown if seconds change
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-center mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-1">
        Preparation Countdown
      </h4>
      <p className="text-2xl font-bold text-gray-700">{formatTime(timeLeft)}</p>
    </div>
  );
}

export default Countdown;
