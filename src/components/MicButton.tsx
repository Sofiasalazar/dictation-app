interface Props {
  isListening: boolean;
  onToggle: () => void;
}

export default function MicButton({ isListening, onToggle }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onToggle}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
          ${isListening
            ? 'bg-violet-600 shadow-lg shadow-violet-600/30'
            : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'}
        `}
      >
        {/* Pulse ring when active */}
        {isListening && (
          <span className="absolute inset-0 rounded-full animate-ping bg-violet-600/40" />
        )}

        {/* Mic icon */}
        <svg
          className={`relative z-10 w-8 h-8 transition-colors ${isListening ? 'text-white' : 'text-neutral-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
          <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 10z" />
        </svg>
      </button>

      <p className="text-xs text-neutral-500">
        {isListening ? 'Click or release Space to stop' : 'Click or hold Space to record'}
      </p>
    </div>
  );
}
