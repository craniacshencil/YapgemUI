import SpeechAnalysisDashboard from "./components/SpeechAnalysis/SpeechAnalysis";
import SpeechRecorder from "./components/SpeechRecorder/SpeechRecorder";
import SpeechTopicGenerator from "./components/TopicGenerator";
import useSpeechStore from "./store/useSpeechStore";

function App() {
  const { analysis, isAnalysisLoading, response, recordingData } =
    useSpeechStore();

  // Show analysis view if we have recording data OR analysis
  const showAnalysis = recordingData || analysis;

  return (
    <div className="w-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 min-h-screen">
      <h1 className="max-w-6xl mx-auto block my-8 text-3xl text-gray-800 font-semibold">
        Speech Analysis
      </h1>
      {!showAnalysis ? (
        <>
          <SpeechTopicGenerator />
          {response && <SpeechRecorder />}
        </>
      ) : (
        <SpeechAnalysisDashboard
          data={analysis}
          isLoading={isAnalysisLoading}
          recordingData={recordingData}
        />
      )}
    </div>
  );
}

export default App;
