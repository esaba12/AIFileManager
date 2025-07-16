import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const industries = [
  { value: "real-estate", label: "Real Estate", description: "Property listings, contracts, client docs" },
  { value: "legal", label: "Legal Services", description: "Case files, contracts, legal documents" },
  { value: "accounting", label: "Accounting", description: "Tax documents, financial records" },
  { value: "other", label: "Other", description: "Tell us about your business" },
];

const teamSizes = [
  { value: "solo", label: "Just me (Solo practice)" },
  { value: "small", label: "Small team (2-10 people)" },
  { value: "medium", label: "Medium team (11-50 people)" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    industry: "",
    teamSize: "",
    businessDescription: "",
    folderStructure: "",
  });
  const [suggestedStructure, setSuggestedStructure] = useState<any>(null);
  const { toast } = useToast();

  const onboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/onboarding", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your workspace has been set up successfully.",
      });
      // Refresh the page to trigger the route change
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onboardingMutation.mutate(formData);
  };

  const generateSuggestedStructure = () => {
    // Mock AI-suggested structure based on industry
    const mockStructure = {
      "real-estate": [
        "📁 Active Properties",
        "  📁 123 Main St",
        "    📄 Purchase Agreement",
        "    📄 Inspection Report",
        "  📁 456 Oak Ave",
        "📁 Closed Properties",
        "📁 Templates & Marketing",
        "📁 Client Communications",
      ],
      "legal": [
        "📁 Active Cases",
        "📁 Client Files",
        "📁 Contracts",
        "📁 Court Documents",
        "📁 Templates",
      ],
      "accounting": [
        "📁 Tax Documents",
        "📁 Financial Records",
        "📁 Client Files",
        "📁 Reports",
        "📁 Templates",
      ],
      "other": [
        "📁 Active Projects",
        "📁 Client Files",
        "📁 Documents",
        "📁 Templates",
      ],
    };

    setSuggestedStructure(mockStructure[formData.industry as keyof typeof mockStructure] || mockStructure.other);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What industry are you in?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industries.map((industry) => (
                <Card
                  key={industry.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.industry === industry.value 
                      ? "ring-2 ring-primary bg-blue-50" 
                      : "hover:border-primary"
                  }`}
                  onClick={() => setFormData({ ...formData, industry: industry.value })}
                >
                  <CardContent className="p-4">
                    <div className="font-medium text-gray-900">{industry.label}</div>
                    <div className="text-sm text-gray-500">{industry.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What's your team size?</h4>
            <RadioGroup 
              value={formData.teamSize} 
              onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
            >
              {teamSizes.map((size) => (
                <div key={size.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={size.value} id={size.value} />
                  <Label htmlFor={size.value} className="cursor-pointer">
                    {size.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What documents do you need to organize?</h4>
            <Textarea
              value={formData.businessDescription}
              onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
              placeholder="Example: I need to organize property contracts, listing agreements, inspection reports, client communications, tax documents, and marketing materials for my real estate business."
              className="min-h-[120px]"
            />
          </div>
        );

      case 4:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Describe your ideal folder structure</h4>
            <Textarea
              value={formData.folderStructure}
              onChange={(e) => setFormData({ ...formData, folderStructure: e.target.value })}
              placeholder="Example: I want folders organized by property address, with subfolders for contracts, inspections, communications, and closing documents. Also need a general folder for templates and marketing materials."
              className="min-h-[120px]"
            />
            
            {formData.folderStructure && (
              <div className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generateSuggestedStructure}
                  className="mb-4"
                >
                  Preview AI Structure
                </Button>
                
                {suggestedStructure && (
                  <Card className="p-4 bg-blue-50">
                    <h5 className="font-semibold text-gray-900 mb-2">AI-Suggested Structure</h5>
                    <div className="text-sm text-gray-700 space-y-1 font-mono">
                      {suggestedStructure.map((item: string, index: number) => (
                        <div key={index}>{item}</div>
                      ))}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" className="bg-accent text-white hover:bg-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.industry !== "";
      case 2:
        return formData.teamSize !== "";
      case 3:
        return formData.businessDescription.trim() !== "";
      case 4:
        return formData.folderStructure.trim() !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Let's Set Up Your Workspace
            </CardTitle>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= currentStep ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-600">
            Help us understand your business so we can create the perfect filing system for you.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!isStepValid()}
                  className="bg-primary hover:bg-blue-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={!isStepValid() || onboardingMutation.isPending}
                  className="bg-accent hover:bg-green-600"
                >
                  {onboardingMutation.isPending ? "Setting up..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
