import React, { useState, useRef } from "react";
import { LogOut, Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "./home/Button";
import API_ENDPOINTS from "../config/api";
import { useUser } from "../contexts/UserContext";

interface UploadCVScreenProps {
  onUploadComplete: () => void;
  onLogout: () => void;
}

const UploadCVScreen: React.FC<UploadCVScreenProps> = ({
  onUploadComplete,
  onLogout,
}) => {
  const { user_id: contextUserId, isLoading } = useUser();
  // ✅ Fallback to localStorage if context hasn't updated yet
  const effectiveUserId = contextUserId || localStorage.getItem("user_id");
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show loading while context is restoring session (first load only)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // If no user_id from either source, session expired
  if (!effectiveUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Session expired. Please login again.
        </div>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError("");

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Files should be in PDF or Word format only.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10MB.");
      return;
    }

    setUploadedFile(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartMatching = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      // ✅ Use effectiveUserId (context or localStorage)
    const token = localStorage.getItem("token");

      if (!effectiveUserId || !token) {
        setError("User ID not found. Please login again.");
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("user_id", effectiveUserId);


const response = await fetch(API_ENDPOINTS.FILES_UPLOAD, {
  method: "POST",
  headers: {
    "X-SESSION-TOKEN": token || "",
  },
  body: formData,
});

      if (!response.ok) {
        console.error("Failed to upload file:", response.statusText);
        setError("Failed to upload file. Please try again.");
        setIsUploading(false);
        return;
      }

      const result = await response.json();
      console.log("File uploaded successfully:", result);

      onUploadComplete(); // Call the completion callback
    } catch (error) {
      console.error("Error during file upload:", error);
      setError("An error occurred while uploading. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jobright-mint/10 to-jobright-teal/5 dark:bg-gradient-to-br dark:from-neon-green/5 dark:to-neon-emerald/5 dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center">
            <div className="w-8 h-8 bg-jobright-teal dark:bg-neon-green rounded-lg flex items-center justify-center mr-3 transition-colors duration-300">
              <span className="text-white font-bold text-sm">DRC</span>
            </div>
            <span className="truncate text-gray-900 dark:text-white font-medium transition-colors duration-300">
              Dheeraj Rathod Consult
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 p-6 sm:p-8 lg:p-10 transition-colors duration-300">
          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              One last step, let's level up your search by uploading your
              resume.
            </h1>
          </div>

          {/* Privacy Notice */}
          <div className="bg-jobright-mint/10 dark:bg-neon-green/10 border border-jobright-mint/20 dark:border-neon-green/20 rounded-lg p-4 mb-8 transition-colors duration-300">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
              Data privacy is the top priority at Jobright. Your resume will
              only be used for job matching and will never be shared with third
              parties. For details, please see our{" "}
              <button className="text-jobright-teal dark:text-neon-green hover:underline font-medium transition-colors duration-300">
                Privacy Policy
              </button>
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 transition-all duration-300 ${
                dragActive
                  ? "border-jobright-teal dark:border-neon-green bg-jobright-teal/5 dark:bg-neon-green/5"
                  : uploadedFile
                  ? "border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-500/10"
                  : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />

              <div className="text-center">
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center transition-colors duration-300">
                        <FileText className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors duration-300" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors duration-300"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center transition-colors duration-300">
                        <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                        Upload Your Resume
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                        Files should be in PDF or Word format and must not
                        exceed 10MB in size.
                      </p>
                      <Button
                        variant="primary"
                        onClick={onButtonClick}
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-2 h-2 bg-jobright-teal dark:bg-neon-green rounded-full transition-colors duration-300"></div>
            <div className="w-2 h-2 bg-jobright-teal dark:bg-neon-green rounded-full transition-colors duration-300"></div>
            <div className="w-2 h-2 bg-jobright-teal dark:bg-neon-green rounded-full transition-colors duration-300"></div>
            <div className="w-2 h-2 bg-gray-300 dark:bg-white/20 rounded-full transition-colors duration-300"></div>
          </div>

          {/* Start Matching Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleStartMatching}
              disabled={!uploadedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Start Uploading"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCVScreen;
