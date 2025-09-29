import { useEffect, useRef } from "react";

export const useAudioVisualizer = (canvasRef, stream, recording) => {
  const animationRef = useRef(null);

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
  }, [recording, stream, canvasRef]);
};
