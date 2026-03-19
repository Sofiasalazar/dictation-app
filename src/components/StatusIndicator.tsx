interface Props {
  isListening: boolean;
  error: string | null;
}

export default function StatusIndicator({ isListening, error }: Props) {
  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        <span className="text-xs text-red-400 capitalize">{error}</span>
      </div>
    );
  }

  if (isListening) {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400" />
        </span>
        <span className="text-xs text-lime-400">Listening...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-neutral-600 shrink-0" />
      <span className="text-xs text-neutral-500">Ready</span>
    </div>
  );
}
