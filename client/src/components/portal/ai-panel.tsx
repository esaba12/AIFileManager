import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Upload, Download, Trash2, Settings, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import VoiceButton from "@/components/ui/voice-button";

interface AIPanelProps {
  onUpload: () => void;
}

export default function AIPanel({ onUpload }: AIPanelProps) {
  const [command, setCommand] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentCommands = [] } = useQuery({
    queryKey: ["/api/ai/commands"],
    refetchInterval: false, // Remove polling for better performance
  });

  const commandMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await apiRequest("POST", "/api/ai/command", { command });
      return response.json();
    },
    onSuccess: () => {
      setCommand("");
      queryClient.invalidateQueries({ queryKey: ["/api/ai/commands"] });
      toast({
        title: "Command sent",
        description: "Your AI command is being processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Command failed",
        description: error.message || "Failed to process command",
        variant: "destructive",
      });
    },
  });

  const handleSubmitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      commandMutation.mutate(command.trim());
    }
  };

  // Use real activity data from API or empty array
  const recentActivities: any[] = [];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* AI Command Box */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Assistant</h3>
        <form onSubmit={handleSubmitCommand} className="space-y-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Try: 'Move all contracts to the legal folder'"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <VoiceButton
                onTranscript={(text) => setCommand(text)}
                size="sm"
                className="h-7 w-7 p-0 min-w-[28px]"
                disabled={commandMutation.isPending}
              />
              <Button
                type="submit"
                size="sm"
                className="h-7 w-7 p-0 min-w-[28px]"
                disabled={!command.trim() || commandMutation.isPending}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Button onClick={() => onUpload()} className="w-full bg-primary hover:bg-blue-600">
            <Upload className="w-4 h-4 mr-2" />
            Add Files
          </Button>
        </form>
      </div>

      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Commands</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentCommands.slice(0, 3).map((cmd: any) => (
              <div key={cmd.id} className="text-xs p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cmd.command}</span>
                  <Badge
                    variant={cmd.status === 'completed' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      cmd.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : cmd.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cmd.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'info' ? 'bg-blue-400' : 'bg-orange-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Add your first file to get started</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">
            <Download className="w-4 h-4 mr-2" />
            Export All Files
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">
            <Trash2 className="w-4 h-4 mr-2" />
            Clean Up Files
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}