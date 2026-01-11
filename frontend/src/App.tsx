"use client"

import type React from "react"
import { useState } from "react"
import { FileUp, AlertCircle, CheckCircle, TrendingUp, BarChart3, Brain } from "lucide-react"
import { GaugeChart } from "./components/GaugeChart"
import { ConfusionMatrix } from "./components/ConfusionMatrix"
import { FeatureWeights } from "./components/FeatureWeights"

const API_URL =
  typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" : "http://localhost:8000"

interface PredictionResult {
  prediction: string
  probability: {
    spam: number
    ham: number
  }
  tokens: string[]
  total_tokens: number
  feature_weights: Array<{
    word: string
    weight: number
    count: number
  }>
  parsed_content: {
    subject_tokens: string[]
    body_tokens_preview: string[]
    content_type: string
  }
}

export default function App() {
  const [emailContent, setEmailContent] = useState("")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setEmailContent(content)
      setError("")
    }
    reader.readAsText(file)
  }

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      setError("Please paste or upload email content")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_content: emailContent }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze email")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const spamProbability = result ? result.probability.spam * 100 : 0
  const isSpam = result?.prediction === "Spam"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Spam Detector</h1>
              <p className="text-sm text-slate-600">Machine Learning Email Classification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-blue-600" />
            Upload or Paste Email
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                <FileUp className="w-5 h-5 mr-2" />
                Choose Email File
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.eml,.msg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Or paste the email content here..."
                className="w-full h-48 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !emailContent.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? "Analyzing..." : "Analyze Email"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Prediction Summary */}
            <div
              className={`bg-gradient-to-br ${isSpam ? "from-red-500 to-rose-600" : "from-green-500 to-emerald-600"} rounded-2xl shadow-xl p-8 text-white`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {isSpam ? <AlertCircle className="w-12 h-12" /> : <CheckCircle className="w-12 h-12" />}
                  <div>
                    <h3 className="text-3xl font-bold">{result.prediction}</h3>
                    <p className="text-white/90">Classification Result</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">{spamProbability.toFixed(1)}%</div>
                  <div className="text-white/90">Confidence</div>
                </div>
              </div>

              <GaugeChart value={spamProbability} />
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technical Analysis */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Technical Analysis
                </h3>

                <div className="space-y-4">
                  <ConfusionMatrix />

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">F1-Score</span>
                      <span className="text-2xl font-bold text-green-600">96.9%</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Model accuracy based on validation dataset (Trec07p corpus)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Tokens Analyzed</div>
                      <div className="text-2xl font-bold text-slate-900">{result.total_tokens}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Content Type</div>
                      <div className="text-sm font-medium text-slate-900">{result.parsed_content.content_type}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Weights */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Key Features
                </h3>
                <p className="text-sm text-slate-600 mb-4">Words with the highest impact on classification</p>
                <FeatureWeights features={result.feature_weights} />
              </div>
            </div>

            {/* Parsed Content Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Parsed Content Preview</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Subject Tokens:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.parsed_content.subject_tokens.map((token, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Body Tokens (Preview):</div>
                  <div className="flex flex-wrap gap-2">
                    {result.parsed_content.body_tokens_preview.map((token, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
          <p>Powered by Logistic Regression & TF-IDF Vectorization</p>
          <p className="mt-2">Dataset: Trec07p Public Spam Corpus</p>
        </div>
      </footer>
    </div>
  )
}
