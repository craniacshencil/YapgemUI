import { useState, useRef, useCallback } from "react";

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null); // ADD THIS
  const [stream, setStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(mediaStream);
      const mediaRecorder = new MediaRecorder(mediaStream);
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
        setAudioBlob(audioBlob); // ADD THIS - store the blob
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(() => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
    stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  return {
    recording,
    audioURL,
    audioBlob, // ADD THIS to the return
    stream,
    startRecording,
    stopRecording,
  };
};
