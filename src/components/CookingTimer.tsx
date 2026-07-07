import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, CheckCircle2, ArrowLeft } from 'lucide-react'

interface CookingTimerProps {
  title: string
  steps: string[]
  onBack: () => void
  onComplete: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CookingTimer({ title, steps, onBack, onComplete }: CookingTimerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Parse default timer from step text (e.g. "Cook for 10 minutes")
  function parseDefaultTimer(stepText: string): number | undefined {
    const match = stepText.match(/(\d+)\s*(minute|min|mins)/i)
    if (match) return parseInt(match[1]) * 60
    return undefined
  }

  function startTimer(seconds: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(seconds)
    setIsRunning(true)
  }

  function pauseTimer() {
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function resetTimer() {
    pauseTimer()
    const defaultTime = parseDefaultTimer(steps[currentStep])
    setTimeLeft(defaultTime || null)
  }

  function completeStep() {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setTimeLeft(null)
      setIsRunning(false)
    } else {
      onComplete()
    }
  }

  function setCustomTimer() {
    const input = prompt('Set timer (minutes):', '5')
    if (input) {
      const mins = parseInt(input)
      if (!isNaN(mins) && mins > 0) {
        startTimer(mins * 60)
      }
    }
  }

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            setIsRunning(false)
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, timeLeft])

  // Auto-suggest timer when step changes
  useEffect(() => {
    const defaultTime = parseDefaultTimer(steps[currentStep])
    if (defaultTime && timeLeft === null) {
      setTimeLeft(defaultTime)
    }
  }, [currentStep])

  const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back & progress */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-orange-500 font-bold flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">
            Step {currentStep + 1}/{steps.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Recipe title */}
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>

      {/* Current step */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Step number */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
            completedSteps.includes(currentStep)
              ? 'bg-green-100 text-green-600'
              : 'bg-orange-100 text-orange-600'
          }`}>
            {completedSteps.includes(currentStep) ? <CheckCircle2 size={20} /> : currentStep + 1}
          </div>
          <div>
            <p className="font-bold text-gray-900">Step {currentStep + 1}</p>
            <p className="text-xs text-gray-400">
              {completedSteps.includes(currentStep) ? 'Completed' : 'In Progress'}
            </p>
          </div>
        </div>

        {/* Step text */}
        <p className="text-gray-700 text-lg leading-relaxed">
          {steps[currentStep]}
        </p>

        {/* Timer display */}
        {timeLeft !== null && (
          <div className="text-center py-6">
            <div className={`text-5xl font-black mb-4 tabular-nums ${
              timeLeft === 0 ? 'text-green-500 animate-bounce' : 'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </div>
            {timeLeft === 0 ? (
              <p className="text-green-600 font-bold">Time's up! ✅</p>
            ) : (
              <div className="flex justify-center gap-3">
                {!isRunning ? (
                  <button
                    onClick={() => startTimer(timeLeft)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all"
                  >
                    <Play size={16} /> Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-300 transition-all"
                  >
                    <Pause size={16} /> Pause
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Set timer button */}
        {timeLeft === null && (
          <div className="flex justify-center gap-3">
            {[5, 10, 15, 20].map(mins => (
              <button
                key={mins}
                onClick={() => startTimer(mins * 60)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                {mins}m
              </button>
            ))}
            <button
              onClick={setCustomTimer}
              className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-100 transition-all"
            >
              Custom
            </button>
          </div>
        )}

        {/* Step actions */}
        <div className="flex gap-3">
          <button
            onClick={completeStep}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
              currentStep === steps.length - 1
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
            }`}
          >
            {currentStep === steps.length - 1 ? '🎉 Complete Recipe' : 'Next Step →'}
          </button>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest px-1">All Steps</h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 ${
                i === currentStep ? 'bg-orange-50' : ''
              } ${i < steps.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                completedSteps.includes(i)
                  ? 'bg-green-100 text-green-600'
                  : i === currentStep
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {completedSteps.includes(i) ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm flex-1 ${
                completedSteps.includes(i) ? 'line-through text-gray-400' : 'text-gray-700'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}