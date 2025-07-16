import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check, HardDrive, Cloud, Shield, Zap, DollarSign, CheckCircle, Mic } from "lucide-react";
import VoiceButton from "@/components/ui/voice-button";
import VoiceAssistant from "@/components/ui/voice-assistant";

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

const storageOptions = [
  {
    type: "local",
    title: "Local Storage",
    description: "Files stored on your device",
    icon: HardDrive,
    pros: ["Free forever", "Complete privacy", "No monthly fees", "Works offline"],
    cons: ["Limited by device storage", "No automatic backups", "Can't access from other devices"],
    recommended: "solo"
  },
  {
    type: "cloud",
    title: "Cloud Storage",
    description: "Files stored securely in the cloud",
    icon: Cloud,
    pros: ["Access from anywhere", "Automatic backups", "Unlimited storage", "Team collaboration"],
    cons: ["Monthly subscription", "Requires internet", "Third-party storage"],
    recommended: "small"
  }
];

const cloudPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "$9/month",
    storage: "100 GB",
    features: ["Up to 1,000 files", "Basic AI features", "Email support"],
    recommended: "solo"
  },
  {
    id: "standard",
    name: "Standard", 
    price: "$19/month",
    storage: "500 GB",
    features: ["Up to 5,000 files", "Advanced AI features", "Priority support", "Team sharing"],
    recommended: "small",
    popular: true
  },
  {
    id: "premium",
    name: "Premium",
    price: "$39/month", 
    storage: "2 TB",
    features: ["Unlimited files", "Premium AI features", "Phone support", "Advanced analytics"],
    recommended: "medium"
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    industry: "",
    teamSize: "",
    businessDescription: "",
    folderStructure: "",
    storageType: "local",
    storagePlan: "basic",
    documentTypes: [] as string[],
    organizationMethod: "by-client",
    clientTypes: [] as string[],
    retentionNeeds: "mixed",
    complianceRequirements: false,
    collaborationStyle: "individual",
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
    if (currentStep < 8) {
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
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your business</h4>
            <div className="space-y-3">
              <Textarea
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                placeholder="Example: I run a real estate business and need to organize property contracts, listing agreements, inspection reports, client communications, tax documents, and marketing materials."
                className="min-h-[120px]"
              />
              <VoiceButton
                onTranscript={(text) => setFormData({ ...formData, businessDescription: text })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What types of documents do you work with most?</h4>
            <p className="text-gray-600 mb-4">Select all that apply - this helps us suggest the right folder structure.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Contracts", "Invoices", "Reports", "Correspondence", "Photos", "Legal Documents", 
                "Financial Records", "Marketing Materials", "Templates", "Client Files", "Project Files", "Other"
              ].map((docType) => (
                <Label key={docType} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.documentTypes.includes(docType)}
                    onChange={(e) => {
                      const types = e.target.checked 
                        ? [...formData.documentTypes, docType]
                        : formData.documentTypes.filter(t => t !== docType);
                      setFormData({ ...formData, documentTypes: types });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{docType}</span>
                </Label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">How do you prefer to organize your files?</h4>
            <RadioGroup 
              value={formData.organizationMethod} 
              onValueChange={(value) => setFormData({ ...formData, organizationMethod: value as any })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="by-client" id="by-client" />
                <Label htmlFor="by-client" className="cursor-pointer">
                  By client or customer (each client gets their own folder)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="by-project" id="by-project" />
                <Label htmlFor="by-project" className="cursor-pointer">
                  By project or case (each project gets its own folder)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="by-type" id="by-type" />
                <Label htmlFor="by-type" className="cursor-pointer">
                  By document type (contracts, invoices, reports, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="by-date" id="by-date" />
                <Label htmlFor="by-date" className="cursor-pointer">
                  By date (monthly or yearly folders)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed" className="cursor-pointer">
                  Mixed approach (combination of the above)
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 6:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Who will be accessing these files?</h4>
            <p className="text-gray-600 mb-4">This helps us understand your sharing and collaboration needs.</p>
            <RadioGroup 
              value={formData.collaborationStyle} 
              onValueChange={(value) => setFormData({ ...formData, collaborationStyle: value as any })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer">
                  Just me (individual use)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team-shared" id="team-shared" />
                <Label htmlFor="team-shared" className="cursor-pointer">
                  My team members need access to files
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client-shared" id="client-shared" />
                <Label htmlFor="client-shared" className="cursor-pointer">
                  Clients need access to their files
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed-collaboration" />
                <Label htmlFor="mixed-collaboration" className="cursor-pointer">
                  Mixed (some files shared, some private)
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 7:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Choose your storage option</h4>
            <div className="space-y-6">
              {/* Storage Type Selection */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-4">Storage Type</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storageOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Card
                        key={option.type}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          formData.storageType === option.type
                            ? "ring-2 ring-primary bg-blue-50"
                            : "hover:border-primary"
                        }`}
                        onClick={() => setFormData({ ...formData, storageType: option.type })}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className="h-6 w-6 text-primary" />
                            <h6 className="font-semibold text-gray-900">{option.title}</h6>
                            {option.recommended === formData.teamSize && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                          
                          {/* Pros */}
                          <div className="mb-3">
                            <h6 className="text-xs font-medium text-green-700 mb-1">Benefits:</h6>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {option.pros.map((pro, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Cons */}
                          <div>
                            <h6 className="text-xs font-medium text-orange-700 mb-1">Consider:</h6>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {option.cons.map((con, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <span className="h-3 w-3 text-orange-500">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Cloud Plan Selection */}
              {formData.storageType === "cloud" && (
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-4">Choose your plan</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cloudPlans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all hover:shadow-md relative ${
                          formData.storagePlan === plan.id
                            ? "ring-2 ring-primary bg-blue-50"
                            : "hover:border-primary"
                        }`}
                        onClick={() => setFormData({ ...formData, storagePlan: plan.id })}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-white">Most Popular</Badge>
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="text-center mb-4">
                            <h6 className="font-semibold text-gray-900 mb-1">{plan.name}</h6>
                            <div className="text-2xl font-bold text-primary mb-1">{plan.price}</div>
                            <div className="text-sm text-gray-600">{plan.storage} storage</div>
                            {plan.recommended === formData.teamSize && (
                              <Badge variant="outline" className="mt-2">
                                Recommended for you
                              </Badge>
                            )}
                          </div>
                          <ul className="text-sm text-gray-600 space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <Shield className="inline h-4 w-4 mr-1" />
                      All plans include enterprise-grade security, automatic backups, and 24/7 support.
                      Cancel anytime with no penalties.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Describe your ideal folder structure</h4>
            <div className="space-y-3">
              <Textarea
                value={formData.folderStructure}
                onChange={(e) => setFormData({ ...formData, folderStructure: e.target.value })}
                placeholder="Example: I want folders organized by property address, with subfolders for contracts, inspections, communications, and closing documents. Also need a general folder for templates and marketing materials."
                className="min-h-[120px]"
              />
              <VoiceButton
                onTranscript={(text) => setFormData({ ...formData, folderStructure: text })}
                className="w-full"
              />
            </div>
            
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
        return formData.documentTypes.length > 0;
      case 5:
        return formData.organizationMethod !== "";
      case 6:
        return formData.collaborationStyle !== "";
      case 7:
        return formData.storageType !== "";
      case 8:
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
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
          {/* Voice Assistant Option */}
          <VoiceAssistant
            questions={[
              "What industry are you in? For example, real estate, legal services, accounting, or something else?",
              "What's your team size? Are you working solo, with a small team of 2-10 people, or a medium team of 11-50 people?",
              "Tell me about your business and what documents you need to organize.",
              "What types of documents do you work with most? For example, contracts, invoices, reports, photos, or legal documents?",
              "How do you prefer to organize your files? By client, by project, by document type, by date, or a mixed approach?",
              "Who will be accessing these files? Just you, your team members, clients, or a mix?",
              "Do you prefer local storage on your device or cloud storage for accessibility?",
              "Describe your ideal folder structure. How would you like your documents organized?"
            ]}
            onAnswers={(answers) => {
              // Map voice answers to form data
              const industryMap: { [key: string]: string } = {
                "real estate": "real-estate",
                "legal": "legal",
                "accounting": "accounting"
              };
              
              const teamMap: { [key: string]: string } = {
                "solo": "solo",
                "small": "small",
                "medium": "medium"
              };
              
              const orgMap: { [key: string]: string } = {
                "client": "by-client",
                "project": "by-project",
                "type": "by-type",
                "date": "by-date",
                "mixed": "mixed"
              };
              
              const collabMap: { [key: string]: string } = {
                "individual": "individual",
                "team": "team-shared",
                "client": "client-shared",
                "mixed": "mixed"
              };

              // Parse answers intelligently
              const industry = Object.keys(industryMap).find(key => 
                answers[0]?.toLowerCase().includes(key)
              ) || "other";
              
              const teamSize = Object.keys(teamMap).find(key => 
                answers[1]?.toLowerCase().includes(key)
              ) || "solo";
              
              const organizationMethod = Object.keys(orgMap).find(key => 
                answers[4]?.toLowerCase().includes(key)
              ) || "by-client";
              
              const collaborationStyle = Object.keys(collabMap).find(key => 
                answers[5]?.toLowerCase().includes(key)
              ) || "individual";
              
              const documentTypes = [
                "Contracts", "Invoices", "Reports", "Photos", "Legal Documents",
                "Financial Records", "Marketing Materials", "Templates", "Client Files"
              ].filter(type => 
                answers[3]?.toLowerCase().includes(type.toLowerCase())
              );
              
              const storageType = answers[6]?.toLowerCase().includes("cloud") ? "cloud" : "local";

              setFormData({
                ...formData,
                industry: industryMap[industry] || industry,
                teamSize: teamMap[teamSize] || teamSize,
                businessDescription: answers[2] || "",
                documentTypes: documentTypes.length > 0 ? documentTypes : ["Other"],
                organizationMethod: orgMap[organizationMethod] || organizationMethod,
                collaborationStyle: collabMap[collaborationStyle] || collaborationStyle,
                storageType: storageType as "local" | "cloud",
                folderStructure: answers[7] || ""
              });
              
              // Skip to final step
              setCurrentStep(8);
            }}
            isProcessing={onboardingMutation.isPending}
            triggerText="🎤 Talk to Assistant (Complete Setup by Voice)"
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">or fill out manually</span>
            </div>
          </div>
          
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep < 8 ? (
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
