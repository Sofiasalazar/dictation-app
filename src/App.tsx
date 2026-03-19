import { useEffect } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import BrowserWarning from './components/BrowserWarning';
import StatusIndicator from './components/StatusIndicator';
import MicButton from './components/MicButton';
import TranscriptArea from './components/TranscriptArea';
import ActionBar from './components/ActionBar';

export default function App() {
  const {
    isSupported,
    isListening,
    finalText,
    interimText,
    error,
    language,
    startListening,
    stopListening,
    clearText,
    setFinalText,
    setLanguage,
  } = useSpeechRecognition();

  // Space bar push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isListening && !e.repeat) {
        e.preventDefault();
        startListening();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isListening) {
        stopListening();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, startListening, stopListening]);

  if (!isSupported) return <BrowserWarning />;

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
            Dictation
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Speak and your words appear instantly
          </p>
        </div>

        {/* Transcript card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Transcript</span>
            <StatusIndicator isListening={isListening} error={error} />
          </div>

          <TranscriptArea
            finalText={finalText}
            interimText={interimText}
            isListening={isListening}
            onChange={setFinalText}
          />

          <ActionBar
            finalText={finalText}
            language={language}
            onClear={clearText}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Mic button */}
        <div className="flex justify-center">
          <MicButton isListening={isListening} onToggle={handleToggle} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-700">
          Agenticsis &mdash; powered by Web Speech API
        </p>
      </div>
    </div>
  );
}
