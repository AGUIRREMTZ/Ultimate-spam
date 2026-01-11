export function ConfusionMatrix() {
  // Based on the actual results from the training
  const matrix = {
    trueNegative: 11281,
    falsePositive: 488,
    falseNegative: 232,
    truePositive: 13194,
  }

  const total = matrix.trueNegative + matrix.falsePositive + matrix.falseNegative + matrix.truePositive
  const accuracy = (((matrix.truePositive + matrix.trueNegative) / total) * 100).toFixed(1)

  return (
    <div>
      <div className="text-sm font-medium text-slate-700 mb-3">Confusion Matrix (Validation Set)</div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div></div>
        <div className="text-center font-medium text-slate-600">Pred: Ham</div>
        <div className="text-center font-medium text-slate-600">Pred: Spam</div>

        <div className="flex items-center font-medium text-slate-600">Actual: Ham</div>
        <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-bold">
          {matrix.trueNegative.toLocaleString()}
        </div>
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-center font-bold">{matrix.falsePositive}</div>

        <div className="flex items-center font-medium text-slate-600">Actual: Spam</div>
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-center font-bold">{matrix.falseNegative}</div>
        <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-bold">
          {matrix.truePositive.toLocaleString()}
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-600">
        Overall Accuracy: <span className="font-bold text-slate-900">{accuracy}%</span>
      </div>
    </div>
  )
}
