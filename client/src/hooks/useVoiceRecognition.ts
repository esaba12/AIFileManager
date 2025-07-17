import { useState, useEffect, useRef } from "react";

interface VoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export function useVoiceRecognition({
  onResult,
  onError,
  continuous = false,
  language = "en-US"
}: VoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.lang = language;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        onResult(transcript.trim());
      };
      
      recognition.onerror = (event: any) => {
        let errorMessage = "Speech recognition error";
        switch (event.error) {
          case 'no-speech':
            errorMessage = "No speech detected. Please try again.";
            break;
          case 'audio-capture':
            errorMessage = "Microphone not accessible. Please check your microphone settings.";
            break;
          case 'not-allowed':
            errorMessage = "Microphone access denied. Please allow microphone access and try again.";
            break;
          case 'network':
            errorMessage = "Network error. Please check your internet connection.";
            break;
          default:
            errorMessage = event.error || "Speech recognition error";
        }
        onError?.(errorMessage);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, onError, continuous, language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Request microphone permission first
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            recognitionRef.current.start();
            setIsListening(true);
          })
          .catch((error) => {
            if (error.name === 'NotAllowedError') {
              onError?.("Microphone access denied. Please allow microphone access and try again.");
            } else {
              onError?.("Failed to access microphone. Please check your microphone settings.");
            }
          });
      } catch (error) {
        onError?.("Failed to start voice recognition");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
}