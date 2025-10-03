import SpeechAnalysisDashboard from "./components/SpeechAnalysis/SpeechAnalysis";
import SpeechRecorder from "./components/SpeechRecorder/SpeechRecorder";
import SpeechTopicGenerator from "./components/TopicGenerator";
import useSpeechStore from "./store/useSpeechStore";

function App() {
  const { analysis, isAnalysisLoading, response } = useSpeechStore();
  return (
    <>
      {!analysis ? (
        <>
          <SpeechTopicGenerator />
          {response && <SpeechRecorder />}
        </>
      ) : (
        <SpeechAnalysisDashboard
          data={analysis}
          isLoading={isAnalysisLoading}
        />
      )}
    </>
  );
}

export default App;
