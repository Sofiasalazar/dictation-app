// v1.1.0
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
            Dictation <span className="text-neutral-500 font-normal">(Speech to Text)</span>
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

        {/* Voice commands reference */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <p className="text-xs text-neutral-600 font-medium uppercase tracking-wider mb-3">Voice Commands</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-neutral-500 font-medium pb-2 pr-4">Say this</th>
                <th className="text-left text-neutral-500 font-medium pb-2">Inserts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {[
                { say: '"comma" / "coma"', symbol: ',' },
                { say: '"period" / "punto" / "full stop"', symbol: '.' },
                { say: '"enter" / "new line"', symbol: '↵' },
                { say: '"question mark"', symbol: '?' },
                { say: '"exclamation" / "exclamation mark"', symbol: '!' },
                { say: '"colon"', symbol: ':' },
                { say: '"semicolon"', symbol: ';' },
              ].map(({ say, symbol }) => (
                <tr key={symbol} className="group">
                  <td className="py-2 pr-4 text-neutral-400 group-hover:text-neutral-300 transition-colors">{say}</td>
                  <td className="py-2 font-mono text-violet-400">{symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center border border-neutral-800 rounded-2xl p-5 bg-neutral-900/50">
          <p className="text-sm text-neutral-400 leading-relaxed">
            Want this tool customized for your brand — or need something built from scratch?{' '}
            <span className="text-neutral-200">We build AI-powered tools that work for your business.</span>
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Get in touch or write to{' '}
            <a href="mailto:info@agenticsis.top" className="text-violet-400 hover:text-violet-300 transition-colors">
              info@agenticsis.top
            </a>{' '}
            — we'll make it yours.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-700">
          Agenticsis &mdash; powered by Web Speech API
        </p>
      </div>
    </div>
  );
}
