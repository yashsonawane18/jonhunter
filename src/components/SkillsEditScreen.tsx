import React, { useState, useRef, useEffect } from 'react';
import { Button } from './home/Button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, LogOut, Briefcase, Check, ChevronsUpDown, Loader } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import API_ENDPOINTS from '../config/api';
import { allSkills } from '../constants/skills';

interface SkillsEditScreenProps {
  initialSkills: string[];
  jobPreferences?: any;
  onSkillsConfirmed: (skills: string[]) => void;
  onLogout: () => void;
}

export default function SkillsEditScreen({ 
  initialSkills, 
  jobPreferences,
  onSkillsConfirmed, 
  onLogout 
}: SkillsEditScreenProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState('');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill) && skills.length < 15) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill('');
      inputRef.current?.focus();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim()) {
      addSkill(newSkill);
    }
  };

  const handleContinue = async () => {
    if (skills.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Get user_id from localStorage
      const user_id = localStorage.getItem('user_id');
      
      if (!user_id) {
        console.error('No user_id found');
        setIsSubmitting(false);
        return;
      }

      // Format job types as a comma-separated string
      const jobTypeString = jobPreferences?.jobTypes?.join(', ') || '';

      // Prepare the payload matching backend structure
      const payload = {
        user_id: user_id,
        job_title: jobPreferences?.jobFunction || '',
        job_location: jobPreferences?.location || '',
        job_type: jobTypeString,
        salary: jobPreferences?.salaryMin || '',
        experience: jobPreferences?.experience || '',
        skills: skills
      };

      console.log('Sending profile data:', payload);

      // Send to backend API
      const token = localStorage.getItem("token");

const response = await fetch(API_ENDPOINTS.SAVE_SKILLS, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SESSION-TOKEN': token || "",
  },
  body: JSON.stringify(payload)
});

if (!user_id || !token) {
  sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
  onLogout();
  setIsSubmitting(false);
  return;
}

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to save profile data:', errorData);
        alert('Failed to save your profile. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log('Profile saved successfully:', data);

      // Continue to job dashboard only if API call succeeds
      onSkillsConfirmed(skills);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving your profile. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-jobright-mint)] via-[var(--color-jobright-teal)] to-cyan-600 dark:bg-gradient-to-br dark:from-neon-green/5 dark:to-neon-emerald/5 dark:bg-black transition-colors duration-300">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-neon-green/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-300">
              <span className="text-white font-medium text-sm sm:text-base">DRC</span>
            </div>
            <div className="text-white">
              <h1 className="font-medium text-lg sm:text-xl">Dheeraj Rathod Consult</h1>
              <p className="text-sm text-white/80 hidden sm:block">Your AI Job Search Companion</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-white hover:bg-white/20 dark:hover:bg-white/10 p-2 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between text-sm text-white/80 dark:text-white/70 mb-2 transition-colors duration-300">
                <span>Step 4 of 5</span>
                <span>80% Complete</span>
              </div>
              <div className="w-full bg-white/20 dark:bg-white/10 rounded-full h-2 transition-colors duration-300">
                <div className="bg-white dark:bg-neon-green h-2 rounded-full w-4/5 transition-all duration-300"></div>
              </div>
            </div>

            {/* Main Skills Card */}
            <Card className="bg-white/95 dark:bg-black backdrop-blur-sm shadow-2xl border-0 dark:border dark:border-white/10 transition-colors duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-900 dark:text-white transition-colors duration-300">Key skills</CardTitle>
                  <Button
                    variant="ghost"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300"
                    onClick={onLogout}
                  >
                    <X className="w-5 h-5 text-gray-900 dark:text-white transition-colors duration-300" />
                  </Button>
                </div>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Add skills that best define your expertise, for e.g. Direct Marketing, Oracle, Java, etc. (Minimum 1, Maximum 15)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Skills</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {skills.length} / 15
                    </span>
                  </div>
                  
                  {/* Current Skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 pl-4 pr-2 py-2 text-sm rounded-full transition-colors duration-300"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors duration-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Skills Input with Dropdown */}
                  <div className="mb-6 space-y-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <button
                          role="combobox"
                          aria-expanded={open}
                          disabled={skills.length >= 15}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-white/50 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-sm"
                        >
                          <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300">
                            {skills.length >= 15 ? 'Maximum skills reached (15/15)' : 'Search and select skills...'}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[min(400px,calc(100vw-2rem))] p-0 bg-white dark:bg-black border-gray-200 dark:border-white/10 transition-colors duration-300 shadow-xl" 
                        align="start"
                        sideOffset={5}
                        style={{ zIndex: 9999 }}
                      >
                        <Command className="bg-white dark:bg-black transition-colors duration-300">
                          <CommandInput placeholder="Search skills..." className="dark:text-white dark:placeholder:text-gray-500 border-0" />
                          <CommandList className="bg-white dark:bg-black transition-colors duration-300 max-h-[300px]">
                            <CommandEmpty className="text-gray-600 dark:text-gray-400 transition-colors duration-300 py-6 text-center">No skill found.</CommandEmpty>
                            <CommandGroup className="p-1">
                              {allSkills
                                .filter(skill => !skills.includes(skill))
                                .map((skill) => (
                                  <CommandItem
                                    key={skill}
                                    value={skill}
                                    onSelect={(currentValue: string) => {
                                      addSkill(currentValue);
                                      setOpen(false);
                                    }}
                                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer px-2 py-1.5 rounded-md transition-colors duration-300 aria-selected:bg-gray-100 dark:aria-selected:bg-white/10"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        skills.includes(skill) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {skill}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Or add custom skill */}
                    <form onSubmit={handleSubmit}>
                      <Input
                        ref={inputRef}
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        disabled={skills.length >= 15}
                        placeholder={skills.length >= 15 ? 'Maximum skills reached' : 'Or type a custom skill and press Enter'}
                        className="bg-white/50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                      />
                    </form>
                    
                    {skills.length >= 15 && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 transition-colors duration-300">
                        You've reached the maximum of 15 skills. Remove a skill to add a new one.
                      </p>
                    )}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                  <Button
                    variant="primary"
                    onClick={handleContinue}
                    disabled={skills.length === 0 || isSubmitting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Saving Profile...' : 'Continue to Job Dashboard'}
                    {!isSubmitting && <Briefcase className="w-4 h-4 ml-2" />}
                  </Button>
                  {skills.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 transition-colors duration-300">
                      Add at least one skill to continue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
