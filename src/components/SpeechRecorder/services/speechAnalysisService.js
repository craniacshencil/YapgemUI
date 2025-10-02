const API_BASE_URL = "http://localhost:8000";

export const speechAnalysisService = {
  async analyzeTranscript(transcript, duration, speakTime, topic) {
    const analysisRes = await fetch(`${API_BASE_URL}/api/analyze-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        duration,
        speakTime,
        topic,
      }),
    });

    if (!analysisRes.ok) {
      throw new Error("Failed to send transcript");
    }

    const res = await analysisRes.json();
    console.log(res);
    return res;
  },
};
