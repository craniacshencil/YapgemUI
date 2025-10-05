const API_BASE_URL = "http://localhost:8000";

export const speechAnalysisService = {
  /**
   * Analyze audio file and get speech analysis
   * @param {Blob} audioBlob - The recorded audio blob
   * @param {number} duration - Total audio duration in seconds
   * @param {number} speakTime - Speaking time in seconds
   * @param {string} topic - Topic for the speech
   * @param {string} whisperModel - Whisper model size (tiny, base, small, medium, large)
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeAudio(
    audioBlob,
    duration,
    speakTime,
    topic,
    whisperModel = "small",
  ) {
    // Create FormData to send multipart/form-data
    const formData = new FormData();

    // Append audio file with proper filename and type
    formData.append("audio", audioBlob, "recording.webm");

    // Append other form fields
    formData.append("duration", duration.toString());
    formData.append("speakTime", speakTime.toString());
    formData.append("topic", topic || "");
    formData.append("whisper_model", whisperModel);

    try {
      const analysisRes = await fetch(`${API_BASE_URL}/api/analyze-speech`, {
        method: "POST",
        // Note: Don't set Content-Type header - browser sets it automatically with boundary
        body: formData,
      });

      if (!analysisRes.ok && analysisRes.status != 400) {
        const errorData = await analysisRes.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Failed to analyze audio: ${analysisRes.status}`,
        );
      }

      const res = await analysisRes.json();
      console.log("Analysis result:", res);
      return res;
    } catch (error) {
      console.error("Error analyzing audio:", error);
      throw error;
    }
  },

  /**
   * Helper function to convert audioURL (blob URL) back to Blob
   * @param {string} audioURL - The blob URL created by URL.createObjectURL
   * @returns {Promise<Blob>} The audio blob
   */
  async urlToBlob(audioURL) {
    const response = await fetch(audioURL);
    return await response.blob();
  },
};
