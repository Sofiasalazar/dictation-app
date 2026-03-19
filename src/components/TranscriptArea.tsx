import { useEffect, useRef } from 'react';

interface Props {
  finalText: string;
  interimText: string;
  isListening: boolean;
  onChange: (text: string) => void;
}

export default function TranscriptArea({ finalText, interimText, isListening, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom as text grows
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [finalText]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={finalText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your dictation will appear here. Click the mic button or hold Space to start..."
        className="
          w-full h-64 resize-none rounded-xl
          bg-neutral-950 border border-neutral-800
          text-neutral-100 placeholder-neutral-600
          text-base leading-relaxed p-4
          focus:outline-none focus:border-violet-500/50
          transition-colors duration-150
          font-sans
        "
        spellCheck
      />
      {/* Interim text shown below the textarea */}
      {isListening && interimText && (
        <p className="mt-2 px-1 text-sm text-neutral-500 italic truncate">
          {interimText}
        </p>
      )}
    </div>
  );
}
