import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, LogOut, Info, Plus, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface JobDetailFormData {
  jobFunction: string;
  customJobFunction?: string;
  jobTypes: string[];
  location: string;
  openToRemote: boolean;
  salaryMin?: string;
  salaryMax?: string;
  experience: string;
}

interface JobDetailScreenProps {
  onComplete: (preferences: JobDetailFormData) => void;
  onLogout: () => void;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({
  onComplete,
  onLogout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [showCustomJobFunction, setShowCustomJobFunction] = useState(false);
  const [showJobFunctionDropdown, setShowJobFunctionDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobDetailFormData>({
    defaultValues: {
      jobTypes: ["Full-time"],
      openToRemote: false,
      location: "",
      salaryMin: "",
      salaryMax: "",
      experience: "",
    },
  });

  const selectedJobTypes = watch("jobTypes") || [];
  const selectedJobFunction = watch("jobFunction");
  const selectedLocation = watch("location");
  const openToRemote = watch("openToRemote");
  const selectedExperience = watch("experience");

  // Comprehensive job categories and roles
  const jobCategories = {
    "Software/Internet/AI": {
      "Software Engineering": [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Mobile Developer (iOS)",
        "Mobile Developer (Android)",
        "DevOps Engineer",
        "Site Reliability Engineer",
        "Software Engineer",
        "Senior Software Engineer",
        "Principal Software Engineer",
        "Engineering Manager",
      ],
      "Data Science & Analytics": [
        "Data Scientist",
        "Data Analyst",
        "Machine Learning Engineer",
        "AI Research Scientist",
        "Business Intelligence Analyst",
        "Data Engineer",
        "Analytics Manager",
      ],
      "Product & Design": [
        "Product Manager",
        "Senior Product Manager",
        "Product Owner",
        "UX Designer",
        "UI Designer",
        "Product Designer",
        "UX Researcher",
        "Design Manager",
      ],
    },
    Consulting: {
      "IT Consulting": [
        "Business Analyst",
        "Data Consultant",
        "IT Consultant",
        "Cyber Security Consultant",
      ],
      "Business Strategy & Management Consulting": [
        "Business Strategy Consultant",
        "Market Research Analyst",
        "Operations Consultant",
      ],
      "Financial Advisory": [
        "Financial Consultant",
        "Risk Management Consultant",
      ],
      "Change Management Consultant": ["Change Management Consultant"],
      "Mergers & Acquisitions (M&A) Consultant": ["M&A Consultant"],
    },
    Marketing: {
      "Digital Marketing": [
        "Digital Marketing Manager",
        "SEO Specialist",
        "Social Media Manager",
        "Content Marketing Manager",
        "Email Marketing Specialist",
        "PPC Specialist",
      ],
      "Brand Marketing": [
        "Brand Manager",
        "Brand Strategist",
        "Creative Director",
        "Marketing Communications Manager",
      ],
      "Growth Marketing": [
        "Growth Marketing Manager",
        "Performance Marketing Manager",
        "Marketing Analytics Manager",
      ],
    },
    Finance: {
      "Corporate Finance": [
        "Financial Analyst",
        "Senior Financial Analyst",
        "Finance Manager",
        "FP&A Analyst",
        "Treasury Analyst",
        "Corporate Development Analyst",
      ],
      "Investment Banking": [
        "Investment Banking Analyst",
        "Investment Banking Associate",
        "Vice President - Investment Banking",
      ],
      "Private Equity": ["Private Equity Analyst", "Private Equity Associate"],
    },
    Product: {
      "Product Management": [
        "Product Manager",
        "Senior Product Manager",
        "Principal Product Manager",
        "VP of Product",
        "Chief Product Officer",
      ],
      "Product Design": [
        "Product Designer",
        "Senior Product Designer",
        "Principal Product Designer",
        "Game Designer",
        "Graphic Designer",
        "UI Designer",
        "UX Designer",
        "3D Designer",
      ],
    },
    Healthcare: {
      Clinical: [
        "Registered Nurse",
        "Physician Assistant",
        "Medical Doctor",
        "Pharmacist",
        "Physical Therapist",
      ],
      "Healthcare Administration": [
        "Healthcare Administrator",
        "Medical Office Manager",
        "Healthcare Consultant",
      ],
      "Medical Research": [
        "Clinical Research Coordinator",
        "Medical Research Scientist",
        "Biostatistician",
      ],
    },
    "Electrical Engineering": {
      "Hardware Engineering": [
        "Electrical Engineer",
        "Hardware Engineer",
        "Electronics Engineer",
        "Power Systems Engineer",
      ],
      "Embedded Systems": [
        "Embedded Software Engineer",
        "Firmware Engineer",
        "IoT Engineer",
      ],
    },
    "Human Resources/Administrative/Legal": {
      "Human Resources": [
        "HR Generalist",
        "HR Business Partner",
        "Talent Acquisition Specialist",
        "Compensation & Benefits Analyst",
        "HR Manager",
      ],
      Legal: [
        "Corporate Lawyer",
        "Paralegal",
        "Legal Counsel",
        "Compliance Officer",
      ],
      Administrative: [
        "Executive Assistant",
        "Office Manager",
        "Administrative Assistant",
      ],
    },
    Sales: {
      "Enterprise Sales": [
        "Account Executive",
        "Sales Development Representative",
        "Customer Success Manager",
        "Sales Manager",
        "VP of Sales",
      ],
      "Inside Sales": [
        "Inside Sales Representative",
        "Sales Coordinator",
        "Lead Generation Specialist",
      ],
    },
    "Production/Manufacturing": {
      Manufacturing: [
        "Manufacturing Engineer",
        "Production Manager",
        "Quality Control Inspector",
        "Supply Chain Manager",
      ],
      Operations: [
        "Operations Manager",
        "Plant Manager",
        "Logistics Coordinator",
      ],
    },
    "Customer Service": {
      "Customer Support": [
        "Customer Support Representative",
        "Technical Support Specialist",
        "Customer Success Specialist",
        "Call Center Representative",
      ],
    },
  };

  // Comprehensive list of countries
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Ireland",
    "Portugal",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Greece",
    "Australia",
    "New Zealand",
    "Japan",
    "South Korea",
    "Singapore",
    "Hong Kong",
    "Taiwan",
    "China",
    "India",
    "Thailand",
    "Malaysia",
    "Philippines",
    "Indonesia",
    "Vietnam",
    "United Arab Emirates",
    "Saudi Arabia",
    "Israel",
    "Turkey",
    "South Africa",
    "Brazil",
    "Argentina",
    "Mexico",
    "Chile",
    "Colombia",
    "Peru",
    "Russia",
    "Ukraine",
    "Romania",
    "Bulgaria",
    "Croatia",
    "Serbia",
    "Slovenia",
    "Slovakia",
    "Lithuania",
    "Latvia",
    "Estonia",
  ].sort();

  const jobTypes = ["Full-time", "Contract", "Part-time", "Internship"];
  
  const experienceLevels = [
    "Entry Level (0-2 years)",
    "Mid Level (3-5 years)",
    "Senior Level (6-10 years)",
    "Lead/Principal (10+ years)",
    "Executive/C-Level"
  ];

  const onSubmit = async (data: JobDetailFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const finalJobFunction = data.customJobFunction || data.jobFunction;
    const preferences = {
      ...data,
      jobFunction: finalJobFunction,
    };
    console.log("Preference opted");
    console.log(preferences);
    onComplete(preferences);
  };

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    const currentTypes = selectedJobTypes;
    if (checked) {
      setValue("jobTypes", [...currentTypes, jobType]);
    } else {
      setValue(
        "jobTypes",
        currentTypes.filter((type) => type !== jobType)
      );
    }
  };

  const handleJobFunctionSelect = (
    category: string,
    subcategory: string,
    role: string
  ) => {
    setValue("jobFunction", role);
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setShowCustomJobFunction(false);
    setShowJobFunctionDropdown(false);
  };

  const handleLocationSelect = (country: string) => {
    setValue("location", country);
    setShowLocationDropdown(false);
    setLocationSearchTerm("");
  };

  const filteredCategories = Object.keys(jobCategories).filter(
    (category) =>
      category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(jobCategories[category]).some(
        (subcategory) =>
          subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
          jobCategories[category][subcategory].some((role) =>
            role.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
  );

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-jobright-mint/10 to-jobright-teal/5 dark:from-neon-green/5 dark:to-neon-emerald/5 dark:bg-black transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-jobright-teal dark:bg-neon-green rounded-lg flex items-center justify-center mr-3 border border-transparent dark:border-neon-green/30 transition-colors duration-300">
                <span className="text-white dark:text-black font-bold text-sm">DRC</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                Dheeraj Rathod Consult
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="bg-white dark:bg-black rounded-2xl shadow-lg dark:shadow-2xl border border-transparent dark:border-white/10 p-6 sm:p-8 lg:p-10 transition-colors duration-300">
            {/* Introduction */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                Hi, I'm Dheeraj, your AI Copilot for job search.
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">
                To get started, what type of role are you looking for?
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Job Function */}
              <div className="space-y-3">
                <Label className="text-gray-900 dark:text-white font-medium flex items-center transition-colors duration-300">
                  Job Function
                  <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500 ml-2">
                    (select from drop-down for best results)
                  </span>
                </Label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowJobFunctionDropdown(!showJobFunctionDropdown)
                    }
                    className="w-full min-h-12 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-jobright-teal dark:focus:ring-neon-green focus:border-transparent text-left flex items-center justify-between transition-colors duration-300"
                  >
                    {selectedJobFunction ? (
                      <span className="text-gray-900 dark:text-white transition-colors duration-300">
                        {selectedJobFunction}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-500 transition-colors duration-300">
                        Please select or type your expected job function
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-900 dark:text-white transition-transform ${
                        showJobFunctionDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showJobFunctionDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg dark:shadow-2xl z-10 max-h-96 overflow-y-auto transition-colors duration-300">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Search job functions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-3 pr-8 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="max-h-80 overflow-y-auto">
                        {filteredCategories.map((category) => (
                          <div
                            key={category}
                            className="border-b border-gray-50 dark:border-white/5 last:border-b-0"
                          >
                            <div className="px-3 py-2 bg-gray-50 dark:bg-white/5 font-medium text-sm text-gray-700 dark:text-white flex items-center transition-colors duration-300">
                              {category}
                              <ChevronDown className="w-4 h-4 ml-auto" />
                            </div>
                            {Object.keys(jobCategories[category]).map(
                              (subcategory) => (
                                <div key={subcategory} className="pl-6">
                                  <div className="px-3 py-2 font-medium text-sm text-gray-600 dark:text-gray-400 bg-gray-25 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
                                    {subcategory}
                                  </div>
                                  {jobCategories[category][subcategory]
                                    .filter(
                                      (role) =>
                                        !searchTerm ||
                                        role
                                          .toLowerCase()
                                          .includes(searchTerm.toLowerCase())
                                    )
                                    .map((role) => (
                                      <button
                                        key={role}
                                        type="button"
                                        onClick={() =>
                                          handleJobFunctionSelect(
                                            category,
                                            subcategory,
                                            role
                                          )
                                        }
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 pl-9 transition-colors duration-300"
                                      >
                                        {role}
                                      </button>
                                    ))}
                                </div>
                              )
                            )}
                          </div>
                        ))}

                        {/* Custom option */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomJobFunction(true);
                            setShowJobFunctionDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-jobright-teal dark:text-neon-green hover:bg-gray-50 dark:hover:bg-white/10 flex items-center transition-colors duration-300"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create a custom job function with "
                          {searchTerm || "your role"}"
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {showCustomJobFunction && (
                  <Input
                    placeholder="Enter your custom job function"
                    {...register("customJobFunction", {
                      required: "Please enter a job function",
                    })}
                    className="mt-2 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-colors duration-300"
                  />
                )}

                {errors.jobFunction &&
                  !selectedJobFunction &&
                  !showCustomJobFunction && (
                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                      Please select a job function
                    </p>
                  )}
              </div>

              {/* Job Type */}
              <div className="space-y-3">
                <Label className="text-gray-900 dark:text-white font-medium flex items-center transition-colors duration-300">
                  Job Type
                  <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {jobTypes.map((jobType) => (
                    <div key={jobType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`jobType-${jobType}`}
                        checked={selectedJobTypes.includes(jobType)}
                        onCheckedChange={(checked) =>
                          handleJobTypeChange(jobType, !!checked)
                        }
                        className="brand-checkbox"
                      />
                      <Label
                        htmlFor={`jobType-${jobType}`}
                        className="text-sm text-gray-900 dark:text-white cursor-pointer transition-colors duration-300"
                      >
                        {jobType}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.jobTypes && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    Please select at least one job type
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-gray-900 dark:text-white font-medium transition-colors duration-300">Location</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowLocationDropdown(!showLocationDropdown)
                    }
                    className="w-full h-12 px-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-jobright-teal dark:focus:ring-neon-green focus:border-transparent text-left flex items-center justify-between transition-colors duration-300"
                  >
                    {selectedLocation ? (
                      <span className="text-gray-900 dark:text-white transition-colors duration-300">{selectedLocation}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-500 transition-colors duration-300">
                        Select your location
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-900 dark:text-white transition-transform ${
                        showLocationDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg dark:shadow-2xl z-10 max-h-80 overflow-y-auto transition-colors duration-300">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-100 dark:border-white/10">
                        <Input
                          type="text"
                          placeholder="Search countries..."
                          value={locationSearchTerm}
                          onChange={(e) =>
                            setLocationSearchTerm(e.target.value)
                          }
                          className="text-sm bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-colors duration-300"
                        />
                      </div>

                      {/* Countries */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => handleLocationSelect(country)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-300"
                          >
                            {country}
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No countries found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {errors.location && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.location.message}
                  </p>
                )}

                {/* Open to Remote */}
                <div className="flex items-center space-x-3 mt-3">
                  <Checkbox
                    id="openToRemote"
                    checked={openToRemote}
                    onCheckedChange={(checked) =>
                      setValue("openToRemote", !!checked)
                    }
                    className="brand-checkbox"
                  />
                  <Label
                    htmlFor="openToRemote"
                    className="text-sm text-gray-900 dark:text-white cursor-pointer flex items-center transition-colors duration-300"
                  >
                    Open to Remote
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500 cursor-help transition-colors duration-300" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
                        <p className="text-sm">
                          Check this if you're willing to work remotely from
                          anywhere, which can significantly expand your job
                          opportunities.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <Label className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                  Experience Level
                  <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                </Label>
                <div className="relative">
                  <select
                    {...register("experience", { required: "Please select your experience level" })}
                    className="w-full h-12 px-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-jobright-teal dark:focus:ring-neon-green focus:border-transparent text-gray-900 dark:text-white transition-colors duration-300 appearance-none cursor-pointer"
                  >
                    <option value="" className="dark:bg-black">Select your experience level</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level} className="dark:bg-black">
                        {level}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900 dark:text-white pointer-events-none transition-colors duration-300" />
                </div>
                {errors.experience && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.experience.message}
                  </p>
                )}
              </div>

              {/* Salary Range */}
              <div className="space-y-3">
                <Label className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                  Expected Salary Range (Annual)
                  <span className="text-sm text-gray-500 dark:text-gray-500 ml-2 font-normal">
                    (Optional)
                  </span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
                      Minimum ($)
                    </Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="e.g., 50000"
                      {...register("salaryMin")}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
                      Maximum ($)
                    </Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="e.g., 80000"
                      {...register("salaryMax")}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  className="px-8 py-3 bg-emerald-600 dark:bg-neon-green hover:bg-emerald-700 dark:hover:bg-green-400 text-white dark:text-black font-semibold rounded-full transition-all duration-300 min-w-24 shadow-lg dark:shadow-[0_0_20px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Processing..." : "Next"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default JobDetailScreen;
