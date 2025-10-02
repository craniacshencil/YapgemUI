import SpeechAnalysisDashboard from "./components/SpeechAnalysis";
import SpeechRecorder from "./components/SpeechRecorder/SpeechRecorder";
import SpeechTopicGenerator from "./components/TopicGenerator";
import useSpeechStore from "./store/useSpeechStore";

function App() {
  const { analysis, isAnalysisLoading } = useSpeechStore();
  return (
    <>
      <SpeechTopicGenerator />
      <SpeechRecorder />
      <SpeechAnalysisDashboard data={analysis} isLoading={isAnalysisLoading} />
    </>
  );
}

export default App;
