"use client";

import { useState } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkVerificationCardProps {
  onFileUpload: (file: File) => void;
}

export function BulkVerificationCard({ onFileUpload }: BulkVerificationCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        setError('Please select a CSV or TXT file');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }
      
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/verification/bulk/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Call the parent callback with the uploaded file info
        onFileUpload(selectedFile);
        setSelectedFile(null);
        
        // Reset the file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Bulk Email Verification</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Process thousands of emails efficiently with batch processing.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email List File</label>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="file-upload"
            />
            <div className="flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-3 text-xs font-medium"
                  asChild
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, TXT (one email per line). Maximum file size: 10MB.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Processing Cost</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Batch Processing
            </Badge>
            <span className="font-bold">1 credit per email</span>
          </div>
        </div>
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          className="w-full mt-auto"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Verify
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
