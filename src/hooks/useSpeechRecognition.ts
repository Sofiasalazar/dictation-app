import { useState, useRef, useCallback, useEffect } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'de-DE', label: 'German' },
  { code: 'fr-FR', label: 'French' },
];

export { SUPPORTED_LANGUAGES };

function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const Ctor: (new () => SpeechRecognition) | undefined =
    w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function useSpeechRecognition() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = typeof window !== 'undefined' ? (window as any) : {};
  const isSupported = !!(w.SpeechRecognition ?? w.webkitSpeechRecognition);

  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState('en-US');

  // Refs to avoid stale closures in recognition callbacks
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const languageRef = useRef('en-US');

  const createRecognition = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return null;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalDelta = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalDelta += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalDelta) {
        setFinalText((prev) => prev + finalDelta);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return; // Ignore silence
      if (event.error === 'aborted') return;   // Ignore manual abort
      setError(event.error);
    };

    recognition.onend = () => {
      setInterimText('');
      // Auto-restart if user hasn't stopped manually
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Recognition may already be starting; ignore
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    if (isListeningRef.current) return;

    isListeningRef.current = true;

    // Create a fresh recognition instance each session
    recognitionRef.current?.abort();
    recognitionRef.current = createRecognition();
    recognitionRef.current?.start();
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText('');
  }, []);

  const clearText = useCallback(() => {
    setFinalText('');
    setInterimText('');
  }, []);

  const setLanguage = useCallback(
    (lang: string) => {
      languageRef.current = lang;
      setLanguageState(lang);
      // If currently listening, restart to apply new language
      if (isListeningRef.current) {
        stopListening();
        setTimeout(() => {
          isListeningRef.current = true;
          recognitionRef.current = createRecognition();
          recognitionRef.current?.start();
        }, 200);
      }
    },
    [stopListening, createRecognition]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return {
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
  };
}
