import { create } from "zustand";

const useSpeechStore = create((set) => ({
  prepTime: "",
  speakTime: "",
  response: null,
  countdownComplete: false,

  setPrepTime: (time) => set({ prepTime: time }),
  setSpeakTime: (time) => set({ speakTime: time }),
  setResponse: (res) => set({ response: res }),
  setCountdownComplete: (val) => set({ countdownComplete: val }),
  /* reset: () =>
    set({
      prepTime: "",
      speakTime: "",
      response: null,
      countdownComplete: false,
    }), */
}));

export default useSpeechStore;
