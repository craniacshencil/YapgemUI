import { useState } from "react";
import { Loader2, Clock, Mic } from "lucide-react";

export default function SpeechTopicGenerator() {
  const [prepTime, setPrepTime] = useState("");
  const [speakTime, setSpeakTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!prepTime || !speakTime) {
      setError("Please enter both prep time and speaking time");
      return;
    }

    if (prepTime <= 0 || speakTime <= 0) {
      setError("Time values must be positive");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        `http://localhost:8000/generate-topic/${prepTime}/${speakTime}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch topic");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(
        err.message ||
          "An error occurred. Make sure the FastAPI server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrepTime("");
    setSpeakTime("");
    setResponse(null);
    setError("");
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Speech Topic Generator
        </h1>

        {/* Input Form Component */}
        {!response && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="space-y-6">
              <div className="text-black">
                <label className="flex items-center text-lg font-medium text-gray-700 mb-2">
                  <Clock className="mr-2" size={20} />
                  Preparation Time (seconds)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 60"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                />
              </div>

              <div className="text-black">
                <label className="flex items-center text-lg font-medium text-gray-700 mb-2">
                  <Mic className="mr-2" size={20} />
                  Speaking Time (seconds)
                </label>
                <input
                  type="number"
                  value={speakTime}
                  onChange={(e) => setSpeakTime(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 120"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
              >
                Generate Topic
              </button>
            </div>
          </div>
        )}

        {/* Loader Component */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-gray-600 text-lg">
              Generating your speech topic...
            </p>
          </div>
        )}

        {/* Response Display Component */}
        {response && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Topic</h2>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {response.topic}
                </h3>
              </div>

              <div className="flex gap-4 text-sm text-gray-600 mb-6">
                <span className="flex items-center">
                  <Clock className="mr-1" size={16} />
                  Prep: {response.prep_time}s
                </span>
                <span className="flex items-center">
                  <Mic className="mr-1" size={16} />
                  Speaking: {response.speaking_time}s
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Key Points to Cover:
              </h4>
              <ul className="space-y-3">
                {response.bullet_points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
