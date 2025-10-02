import { create } from "zustand";

const useSpeechStore = create((set) => ({
  prepTime: "",
  speakTime: "",
  response: null,
  countdownComplete: false,
  analysis: null,
  isAnalysisLoading: true,

  setPrepTime: (time) => set({ prepTime: time }),
  setSpeakTime: (time) => set({ speakTime: time }),
  setResponse: (res) => set({ response: res }),
  setAnalysis: (data) => set({ analysis: data }),
  setIsAnalysisLoading: (state) => set({ isAnalysisLoading: state }),
  setCountdownComplete: (val) => set({ countdownComplete: val }),
}));

export default useSpeechStore;
