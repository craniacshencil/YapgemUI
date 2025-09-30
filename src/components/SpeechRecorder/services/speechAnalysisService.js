const API_BASE_URL = "http://localhost:8000";

export const speechAnalysisService = {
  async analyzeTranscript(transcript, duration, speakTime) {
    const response = await fetch(`${API_BASE_URL}/api/analyze-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        duration,
        speakTime,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send transcript");
    }

    return await response.json();
  },
};
