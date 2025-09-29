import { useState, useEffect } from "react";

export const useRecordingTimer = (recording, speakTime, onComplete) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    if (elapsed >= speakTime && recording) {
      onComplete();
    }
  }, [elapsed, speakTime, recording, onComplete]);

  return { elapsed, remaining: Math.max(speakTime - elapsed, 0) };
};
