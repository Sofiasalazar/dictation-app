import { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../hooks/useSpeechRecognition';

interface Props {
  finalText: string;
  language: string;
  onClear: () => void;
  onLanguageChange: (lang: string) => void;
}

export default function ActionBar({ finalText, language, onClear, onLanguageChange }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!finalText) return;
    await navigator.clipboard.writeText(finalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Copy */}
      <button
        onClick={handleCopy}
        disabled={!finalText}
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-neutral-800 border border-neutral-700
          text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        {copied ? 'Copied' : 'Copy'}
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        disabled={!finalText}
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-neutral-800 border border-neutral-700
          text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        Clear
      </button>

      {/* Language select */}
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="
          ml-auto px-3 py-2 rounded-lg text-sm
          bg-neutral-800 border border-neutral-700
          text-neutral-300 focus:outline-none focus:border-violet-500/50
          cursor-pointer transition-colors duration-150
        "
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
