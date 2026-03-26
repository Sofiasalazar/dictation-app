import { useState, useRef, useCallback, useEffect } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'de-DE', label: 'German' },
  { code: 'fr-FR', label: 'French' },
];

export { SUPPORTED_LANGUAGES };

// Maps spoken punctuation words → symbols, ordered longest-match first.
// Covers English, Spanish, German, and French commands.
const PUNCTUATION_COMMANDS: [RegExp, string][] = [
  // New line / paragraph
  [/\b(new line|new paragraph|nueva línea|nueva linea|neue zeile|nouvelle ligne)\b/gi, '\n'],
  // Ellipsis
  [/\b(ellipsis|puntos suspensivos|Auslassungszeichen|points de suspension)\b/gi, '...'],
  // Double quote open/close
  [/\b(open quote|open quotes|comillas abrir|öffnendes anführungszeichen|ouvrir guillemet)\b/gi, '"'],
  [/\b(close quote|close quotes|comillas cerrar|schließendes anführungszeichen|fermer guillemet)\b/gi, '"'],
  // Parentheses
  [/\b(open parenthesis|left parenthesis|paréntesis abrir|klammer auf|ouvrir parenthèse)\b/gi, '('],
  [/\b(close parenthesis|right parenthesis|paréntesis cerrar|klammer zu|fermer parenthèse)\b/gi, ')'],
  // Multi-word punctuation names before single-word ones
  [/\b(question mark|signo de interrogación|signo de interrogacion|Fragezeichen|point d'interrogation)\b/gi, '?'],
  [/\b(exclamation mark|exclamation point|signo de exclamación|signo de exclamacion|Ausrufezeichen|point d'exclamation)\b/gi, '!'],
  [/\b(full stop|punto final|punto)\b/gi, '.'],
  [/\b(semicolon|punto y coma|Semikolon|point-virgule)\b/gi, ';'],
  [/\b(colon|dos puntos|Doppelpunkt|deux points)\b/gi, ':'],
  [/\b(dash|guión largo|Gedankenstrich|tiret)\b/gi, ' -- '],
  [/\b(hyphen|guión|Bindestrich|trait d'union)\b/gi, '-'],
  // Simple single-word commands last
  [/\b(comma|coma|Komma|virgule)\b/gi, ','],
  [/\b(period|Punkt|point)\b/gi, '.'],
];

// After applying punctuation, capitalize the first letter following . ! ? \n
function applyPunctuation(text: string): string {
  let result = text;
  for (const [pattern, symbol] of PUNCTUATION_COMMANDS) {
    // Replace " word" or "word " patterns cleanly, trimming surrounding spaces
    result = result.replace(pattern, (_match, _p1, offset, str) => {
      // Remove a leading space if the symbol attaches to the previous word
      const attachesLeft = [',', '.', '!', '?', ';', ':'].includes(symbol);
      const before = attachesLeft && str[offset - 1] === ' ' ? '' : '';
      return before + symbol;
    });
  }
  // Collapse multiple spaces (but preserve newlines)
  result = result.replace(/[ \t]{2,}/g, ' ');
  // Capitalize first letter after sentence-ending punctuation + space
  result = result.replace(/([.!?]\s+)([a-záéíóúüñàâçèêîôùûäöß])/gi, (_, punct, letter) =>
    punct + letter.toUpperCase()
  );
  // Capitalize after newline
  result = result.replace(/(\n)([a-záéíóúüñàâçèêîôùûäöß])/gi, (_, nl, letter) =>
    nl + letter.toUpperCase()
  );
  return result;
}

const isMobile = typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
  // Two-layer mobile Chrome duplicate guard:
  // 1. sessionIdRef: each instance gets a unique ID; onresult from a stale
  //    instance is dropped immediately (cross-session late-fire bug).
  // 2. lastFinalIndexRef: tracks the highest result index already committed
  //    in the current session; re-fired events for the same index are skipped
  //    (intra-session duplicate bug). Reset in onstart, not during creation,
  //    so old late-fire events still see the correct value before the reset.
  const sessionIdRef = useRef(0);
  const lastFinalIndexRef = useRef(-1);

  const createRecognition = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return null;
    const sessionId = ++sessionIdRef.current; // Stamp this instance with a unique ID

    recognition.continuous = !isMobile; // false on mobile prevents result accumulation
    recognition.interimResults = true;
    recognition.lang = languageRef.current;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      lastFinalIndexRef.current = -1; // Reset index guard when new session actually starts
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Ignore events from a stale instance (mobile Chrome sometimes fires
      // onresult on the old instance after a new session has already started).
      if (sessionId !== sessionIdRef.current) return;

      let interim = '';
      let finalDelta = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          if (i <= lastFinalIndexRef.current) continue; // Already committed this index
          lastFinalIndexRef.current = i;
          finalDelta += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalDelta) {
        setFinalText((prev) => applyPunctuation(prev + finalDelta));
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
      if (isListeningRef.current) {
        // Invalidate old session IMMEDIATELY so any late onresult events
        // from this instance are dropped by the session ID guard before
        // the new session starts.
        sessionIdRef.current++;
        setTimeout(() => {
          if (!isListeningRef.current) return;
          recognitionRef.current = createRecognition();
          recognitionRef.current?.start();
        }, isMobile ? 300 : 0); // 300ms drain window on mobile; instant on desktop
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
