import { create } from "zustand";

const useSpeechStore = create((set) => ({
  prepTime: "",
  speakTime: "",
  response: null,
  countdownComplete: false,
  analysis: null,
  isAnalysisLoading: true,
  recordingData: null,

  reset: () =>
    set({
      prepTime: "",
      speakTime: "",
      response: null,
      countdownComplete: false,
      analysis: null,
      isAnalysisLoading: true,
      recordingData: null,
      recordingData: null,
    }),

  setPrepTime: (time) => set({ prepTime: time }),
  setRecordingData: (data) => set({ recordingData: data }),
  setSpeakTime: (time) => set({ speakTime: time }),
  setResponse: (res) => set({ response: res }),
  setAnalysis: (data) => set({ analysis: data }),
  setIsAnalysisLoading: (state) => set({ isAnalysisLoading: state }),
  setCountdownComplete: (val) => set({ countdownComplete: val }),
}));

export default useSpeechStore;
