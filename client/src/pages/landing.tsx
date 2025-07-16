import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FolderOpen, MessageSquare, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Filing Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                Pricing
              </Button>
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                Login
              </Button>
              <Button onClick={handleGetStarted} className="bg-primary text-white hover:bg-blue-600">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Intelligent Document Management
              <br />
              <span className="text-primary">Powered by AI</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your business documents with AI-powered organization, OCR processing, and intelligent filing. 
              Perfect for real estate professionals, legal teams, and service-based businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary text-white hover:bg-blue-600 text-lg px-8 py-3"
                onClick={handleGetStarted}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-3"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Organize Your Business
            </h3>
            <p className="text-lg text-gray-600">
              AI-powered tools that understand your business and organize your documents intelligently
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Smart OCR Processing</h4>
                <p className="text-gray-600">
                  Automatically extract text from scanned documents, images, and PDFs with high accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Organization</h4>
                <p className="text-gray-600">
                  Let AI create and maintain your folder structure based on your business needs
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Natural Language Commands</h4>
                <p className="text-gray-600">
                  Control your file system with simple commands like "Move all leases to the contracts folder"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
