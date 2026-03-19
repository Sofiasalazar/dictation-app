export default function BrowserWarning() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-100 mb-2">Browser not supported</h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          This app uses the Web Speech API, which requires <strong className="text-neutral-200">Google Chrome</strong> or <strong className="text-neutral-200">Microsoft Edge</strong>.
        </p>
        <p className="text-neutral-500 text-xs mt-4">Firefox and Safari do not support real-time speech recognition.</p>
      </div>
    </div>
  );
}
