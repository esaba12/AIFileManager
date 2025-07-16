import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
}

export default function VoiceButton({
  onTranscript,
  className,
  variant = "outline",
  size = "default",
  disabled = false
}: VoiceButtonProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      setIsProcessing(false);
      onTranscript(transcript);
      toast({
        title: "Voice captured",
        description: "Your voice has been converted to text.",
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Voice recognition error",
        description: error,
        variant: "destructive",
      });
    },
    continuous: false,
    language: "en-US"
  });

  const handleVoiceClick = () => {
    if (!isSupported) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      setIsProcessing(true);
    } else {
      startListening();
      toast({
        title: "Listening...",
        description: "Speak clearly and click the microphone again when finished.",
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleVoiceClick}
      disabled={disabled || isProcessing}
      className={cn(
        "relative",
        isListening && "bg-red-500 hover:bg-red-600 text-white animate-pulse",
        className
      )}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isListening ? "Stop" : "Voice"}
      </span>
      {isListening && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
      )}
    </Button>
  );
}