import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, MessageCircle, Volume2 } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useToast } from "@/hooks/use-toast";

interface VoiceAssistantProps {
  questions: string[];
  onAnswers: (answers: string[]) => void;
  isProcessing?: boolean;
  triggerText?: string;
}

export default function VoiceAssistant({
  questions,
  onAnswers,
  isProcessing = false,
  triggerText = "Talk to Assistant"
}: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const { isListening: voiceListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      handleVoiceAnswer(transcript);
    },
    onError: (error) => {
      toast({
        title: "Voice recognition error",
        description: error,
        variant: "destructive",
      });
      setIsListening(false);
    },
    continuous: false,
    language: "en-US"
  });

  const speakQuestion = (question: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(question);
      
      // Get available voices and prefer more natural ones
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') ||
        voice.name.includes('Premium') ||
        (voice.lang === 'en-US' && voice.name.includes('Female'))
      ) || voices.find(voice => voice.lang === 'en-US' && voice.default);
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // More natural speech settings
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceAnswer = (transcript: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = transcript;
    setAnswers(newAnswers);
    setIsListening(false);
    
    toast({
      title: "Answer recorded",
      description: `"${transcript}"`,
    });

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        speakQuestion(questions[currentQuestionIndex + 1]);
        
        // Auto-start listening for next answer
        setTimeout(() => {
          if (!voiceListening) {
            startListening();
            setIsListening(true);
          }
        }, 3000);
      }, 1500);
    } else {
      // Conversation complete
      const completionMessage = "Great! I have all your answers. You can review them or complete the setup.";
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(completionMessage);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        }
      }, 1000);
    }
  };

  const handleStartVoiceSession = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsListening(false);
    
    // Wait for voices to load, then speak
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        speakQuestion(questions[0]);
      }, { once: true });
    } else {
      speakQuestion(questions[0]);
    }
    
    // Auto-start listening after speaking
    setTimeout(() => {
      if (!voiceListening) {
        startListening();
        setIsListening(true);
      }
    }, 2000);
  };

  const handleVoiceToggle = () => {
    if (voiceListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const handleComplete = () => {
    onAnswers(answers);
    setIsOpen(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const isComplete = answers.filter(a => a.trim()).length === questions.length;

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageCircle className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Voice Assistant Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</h4>
                  <p className="text-sm text-gray-600">Speak your answer clearly</p>
                </div>
                <Badge variant="secondary">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Assistant asks:</span>
                  </div>
                  <p className="text-gray-800">{questions[currentQuestionIndex]}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    onClick={handleVoiceToggle}
                    className={`flex-1 ${
                      voiceListening 
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={isProcessing}
                  >
                    {voiceListening ? (
                      <>
                        <MicOff className="h-5 w-5 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => speakQuestion(questions[currentQuestionIndex])}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>

                {answers[currentQuestionIndex] && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Your answer:</p>
                    <p className="text-green-700">{answers[currentQuestionIndex]}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  disabled={!answers[currentQuestionIndex]}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!isComplete || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? "Processing..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleStartVoiceSession}
              className="text-blue-600 hover:text-blue-800"
            >
              Start Voice Session (Full Auto Mode)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}