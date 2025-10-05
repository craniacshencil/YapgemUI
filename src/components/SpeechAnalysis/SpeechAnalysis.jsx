import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  BookOpen,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { CompletedView } from "./CompletedView";

const SpeechAnalysisDashboard = ({ data, isLoading, recordingData }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (recordingData) {
    const errorMessage = recordingData.errorMessage;
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Loading state for analysis */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Analyzing Your Speech
              </h2>
              <p className="text-gray-600">
                Processing natural language and calculating metrics...
              </p>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                  <span>Extracting keywords</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div
                    className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span>Analyzing sentiment</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div
                    className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span>Checking grammar</span>
                </div>
              </div>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">
                    No speech was recognized
                  </p>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Show completed view if we have transcript */}

          {!isLoading && !errorMessage && (
            <CompletedView
              duration={recordingData.duration}
              audioURL={recordingData.audioURL}
              transcript={data?.extras?.transcript || "No transcript"}
              isProcessing={false}
            />
          )}

          {/* Analysis Results */}
          {data && (
            <div>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Topic Match"
                  icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                  value={`${Math.round(data.semantic_similarity * 100)}%`}
                  score={data.semantic_similarity}
                />
                <StatCard
                  label="Vocabulary"
                  icon={<BookOpen className="w-5 h-5 text-blue-500" />}
                  value={`${Math.round(data.vocabulary_richness * 100)}%`}
                  score={data.vocabulary_richness}
                />
                <SentimentCard sentiment={data.sentiment} />
                <GrammarCard grammarIssues={data.grammar_issues} />
              </div>

              {/* Main Content Area */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {["overview", "grammar", "keywords"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? "text-indigo-600 border-b-2 border-indigo-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "overview" && <OverviewTab data={data} />}
                  {activeTab === "grammar" && <GrammarTab data={data} />}
                  {activeTab === "keywords" && <KeywordsTab data={data} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No recording data yet - show empty state
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Analysis Yet
        </h2>
        <p className="text-gray-600">
          Start speaking to see your analysis results
        </p>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ label, icon, value, score }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return "Excellent";
    if (score >= 0.6) return "Good";
    return "Needs Work";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div
        className={`text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block ${getScoreColor(score)}`}
      >
        {getScoreLabel(score)}
      </div>
    </div>
  );
};

const SentimentCard = ({ sentiment }) => {
  const getSentimentLabel = (compound) => {
    if (compound >= 0.5)
      return { label: "Positive", color: "text-green-600 bg-green-50" };
    if (compound >= 0)
      return { label: "Neutral", color: "text-blue-600 bg-blue-50" };
    return { label: "Negative", color: "text-red-600 bg-red-50" };
  };

  const sentimentData = getSentimentLabel(sentiment.compound);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Sentiment</span>
        <MessageSquare className="w-5 h-5 text-pink-500" />
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {sentimentData.label}
      </div>
      <div
        className={`text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block ${sentimentData.color}`}
      >
        {Math.round(sentiment.compound * 100)}% confidence
      </div>
    </div>
  );
};

const GrammarCard = ({ grammarIssues }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Grammar Issues</span>
        {grammarIssues.length === 0 ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-500" />
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {grammarIssues.length}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {grammarIssues.length === 0 ? "Perfect!" : "Found issues"}
      </div>
    </div>
  );
};

const OverviewTab = ({ data }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Speech Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Words</div>
            <div className="text-xl font-bold text-gray-900">
              {data.extras.num_words}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Speaking Speed</div>
            <div className="text-xl font-bold text-gray-900">
              {data.extras.words_per_minute_est} WPM
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Duration</div>
            <div className="text-xl font-bold text-gray-900">
              {data.extras.duration_reported}s
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Readability
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Reading Ease</span>
            <span className="font-medium text-gray-900">
              {data.sentence_metrics.complexity.flesch_reading_ease.toFixed(1)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(data.sentence_metrics.complexity.flesch_reading_ease, 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-600">Grade Level</span>
            <span className="font-medium text-gray-900">
              {data.sentence_metrics.complexity.flesch_kincaid_grade.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GrammarTab = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.grammar_issues.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Grammar Issues Found!
          </h3>
          <p className="text-gray-600">Your speech is grammatically correct.</p>
        </div>
      ) : (
        data.grammar_issues.map((issue, idx) => (
          <div
            key={idx}
            className="border border-orange-200 bg-orange-50 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {issue.message}
                </p>
                <div className="bg-white rounded px-3 py-2 text-sm text-gray-700 mb-2">
                  {issue.context}
                </div>
                {issue.replacements.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Suggestion:</span>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      {issue.replacements[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const KeywordsTab = ({ data }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Key Topics Mentioned
      </h3>
      <div className="flex flex-wrap gap-2">
        {data.keywords.slice(0, 8).map((keyword, idx) => (
          <span
            key={idx}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SpeechAnalysisDashboard;
