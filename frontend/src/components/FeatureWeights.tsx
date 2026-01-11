interface Feature {
  word: string
  weight: number
  count: number
}

interface FeatureWeightsProps {
  features: Feature[]
}

export function FeatureWeights({ features }: FeatureWeightsProps) {
  const maxAbsWeight = Math.max(...features.map((f) => Math.abs(f.weight * f.count)))

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {features.map((feature, idx) => {
        const impact = (Math.abs(feature.weight * feature.count) / maxAbsWeight) * 100
        const isSpamIndicator = feature.weight > 0

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-900">{feature.word}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isSpamIndicator ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {isSpamIndicator ? "Spam" : "Ham"} ({feature.count}x)
              </span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`absolute h-full transition-all ${
                  isSpamIndicator
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : "bg-gradient-to-r from-green-400 to-green-600"
                }`}
                style={{ width: `${impact}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
