"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, AlertCircle, Clock, Image as ImageIcon, FileText } from "lucide-react";

interface UploadResponse {
  success: boolean;
  id: string;
  zipUrl: string;
  fileName: string;
  fileSize: number;
  listingId: string;
  message: string;
  timestamp: string;
}

interface ProcessStatus {
  listing: {
    id: string;
    title: string;
    address: string;
    type: string;
    price: number;
    status: string;
    createdAt: string;
  };
  media: Array<{
    id: string;
    url: string;
    category: string;
    aiTags: string[];
    aiSaliencyScore: number;
    processingStatus: string;
  }>;
  aiResults: {
    headline: string;
    shortDesc: string;
    longDesc: string;
    bulletPoints: string[];
    seoTitle: string;
    seoDescription: string;
    priceSuggestion: number;
    targetAudience: string;
  } | null;
  progress: {
    images: {
      total: number;
      processed: number;
      percentage: number;
      status: string;
    };
    ai: {
      generated: boolean;
      complete: boolean;
      status: string;
      hasPlaceholder: boolean;
    };
    overall: {
      status: string;
      percentage: number;
      estimatedCompletion: string;
    };
  };
  nextSteps: string[];
}

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "Test Listing - Vinohrady",
    address: "Vinohradská 123, Praha 2",
    type: "APARTMENT",
    price: "5900000",
    area: "65",
    rooms: "3",
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith(".zip") && !fileName.endsWith(".7z")) {
        setError("Please select a ZIP or 7Z file");
        return;
      }
      
      // Check file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File too large. Maximum size is 100MB");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("zipFile", file);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("rooms", formData.rooms);

      const response = await fetch("/api/upload/zip", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result: UploadResponse = await response.json();
      setUploadResult(result);
      
      // Start polling for processing status
      setPolling(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Poll for processing status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (polling && uploadResult?.listingId) {
      const fetchStatus = async () => {
        try {
          const response = await fetch(`/api/process/zip/${uploadResult.listingId}`);
          if (response.ok) {
            const status: ProcessStatus = await response.json();
            setProcessStatus(status);
            
            // Stop polling if processing is complete
            if (status.progress.overall.status === "completed") {
              setPolling(false);
            }
          }
        } catch (err) {
          console.error("Error fetching status:", err);
        }
      };

      // Initial fetch
      fetchStatus();
      
      // Poll every 2 seconds
      intervalId = setInterval(fetchStatus, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [polling, uploadResult?.listingId]);

  // Reset form
  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setProcessStatus(null);
    setPolling(false);
    setError(null);
    setFormData({
      title: "Test Listing - Vinohrady",
      address: "Vinohradská 123, Praha 2",
      type: "APARTMENT",
      price: "5900000",
      area: "65",
      rooms: "3",
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Test Upload & Processing</h1>
        <p className="text-gray-600">
          Upload a ZIP file with real estate photos and watch the AI processing pipeline in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Upload form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload ZIP File
            </CardTitle>
            <CardDescription>
              Upload a ZIP or 7Z file containing property photos (max 100MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Property Photos (ZIP/7Z)</Label>
              <Input
                id="file"
                type="file"
                accept=".zip,.7z"
                onChange={handleFileChange}
                disabled={uploading || polling}
              />
              {file && (
                <div className="text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={uploading || polling}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={uploading || polling}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={uploading || polling}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Kč)</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={uploading || polling}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area (m²)</Label>
                  <Input
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    disabled={uploading || polling}
                  />
                </div>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload button */}
            <div className="flex gap-4">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading || polling}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={uploading}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Status display */}
        <div className="space-y-6">
          {/* Upload result */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Upload Successful
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-500">Listing ID</div>
                    <div className="font-mono">{uploadResult.listingId}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">File</div>
                    <div>{uploadResult.fileName}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Size</div>
                    <div>{(uploadResult.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Status</div>
                    <Badge variant="outline" className="bg-green-50">
                      Uploaded
                    </Badge>
                  </div>
                </div>
                <Alert>
                  <AlertDescription>
                    {uploadResult.message} Processing will begin automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Processing status */}
          {processStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {processStatus.progress.overall.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  Processing Status
                </CardTitle>
                <CardDescription>
                  {polling ? "Polling every 2 seconds..." : "Processing complete!"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{processStatus.progress.overall.percentage}%</span>
                  </div>
                  <Progress value={processStatus.progress.overall.percentage} />
                  <div className="text-sm text-gray-600">
                    Estimated completion: {processStatus.progress.overall.estimatedCompletion}
                  </div>
                </div>

                {/* Image processing */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="font-medium">Image Processing</span>
                    <Badge variant={
                      processStatus.progress.images.status === "completed" ? "default" :
                      processStatus.progress.images.status === "processing" ? "secondary" :
                      "outline"
                    }>
                      {processStatus.progress.images.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    {processStatus.progress.images.processed} of {processStatus.progress.images.total} images processed
                  </div>
                  <Progress value={processStatus.progress.images.percentage} />
                </div>

                {/* AI generation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">AI Content Generation</span>
                    <Badge variant={
                      processStatus.progress.ai.status === "completed" ? "default" :
                      processStatus.progress.ai.status === "processing" ? "secondary" :
                      "outline"
                    }>
                      {processStatus.progress.ai.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    {processStatus.progress.ai.complete ? "Content generated" : "Generating content..."}
                  </div>
                </div>

                {/* Next steps */}
                {processStatus.nextSteps.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium">Next Steps</div>
                    <ul className="space-y-1 text-sm">
                      {processStatus.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Results preview */}
                {processStatus.aiResults && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="font-medium">AI Generated Content</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-500">Headline</div>
                        <div>{processStatus.aiResults.headline}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-500">Short Description</div>
                        <div>{processStatus.aiResults.shortDesc}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-500">Price Suggestion</div>
                        <div>{processStatus.aiResults.priceSuggestion?.toLocaleString()} Kč</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {!uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle>How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Prepare a ZIP file</div>
                    <div className="text-gray-600">Create a ZIP file with property photos (max 100MB)</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Fill in property details</div>
                    <div className="text-gray-600">Update the form fields or use default values</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Upload & watch</div>
                    <div className="text-gray-600">Click upload and watch the AI processing pipeline</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    4
                  </div>
                  <div>
                    <div className="font-medium">Check results</div>
                    <div className="text-gray-600">View AI-generated content and media processing results</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
