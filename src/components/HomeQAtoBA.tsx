import React from 'react';
import { QAtoBANavbar } from './qa-to-ba/QAtoBANavbar';
import { QAtoBAHero } from './qa-to-ba/QAtoBAHero';
import { Ticker } from './qa-to-ba/Ticker';
import { AudienceSection } from './qa-to-ba/AudienceSection';
import { ProgramsSection } from './qa-to-ba/ProgramsSection';
import { CtaBanner } from './qa-to-ba/CtaBanner';
import { FeaturesSection } from './qa-to-ba/FeaturesSection';
import { WhyProductRoles } from './qa-to-ba/WhyProductRoles';
import { CurriculumSection } from './qa-to-ba/CurriculumSection';
import { PlacementSection } from './qa-to-ba/PlacementSection';
import { FaqSection } from './qa-to-ba/FaqSection';
import { ProcessSection } from './qa-to-ba/ProcessSection';
import { SuccessStoriesSection } from './qa-to-ba/SuccessStoriesSection';
import { CtaBanner2 } from './qa-to-ba/CtaBanner2';
import { RegisterSection } from './qa-to-ba/RegisterSection';
import { FinalCtaSection } from './qa-to-ba/FinalCtaSection';
import { MeetYourMentor } from './qa-to-ba/MeetYourMentor';
import { TransitionMilestones } from './qa-to-ba/TransitionMilestones';
import { TransitionFramework } from './qa-to-ba/TransitionFramework';
import { VideoTestimonials } from './qa-to-ba/VideoTestimonials';
import { WhatsAppHallOfFame } from './qa-to-ba/WhatsAppHallOfFame';
import TransitionBenefits from './qa-to-ba/TransitionBenefits';

interface HomeQAtoBAProps {
  onGetStarted?: () => void;           // navigates to signup/login
  onNavigateToQAtoBA?: () => void;     // navigates to qa-to-ba page
  onNavigateToPricing?: () => void;    // navigates to pricing page
}

const HomeQAtoBA: React.FC<HomeQAtoBAProps> = ({
  onGetStarted,
  onNavigateToQAtoBA,
  onNavigateToPricing,
}) => {

  const handleWatchSuccess = () => {
    const el = document.getElementById('video-testimonials');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-white overflow-x-clip">
      <main className="w-full min-w-0 overflow-x-clip">
        <QAtoBAHero 
          onGetStarted={onGetStarted}
          onWatchSuccess={handleWatchSuccess}
        />
        <Ticker />
        <AudienceSection /> 
        <TransitionMilestones />
        <TransitionFramework />
        <VideoTestimonials />
        <WhatsAppHallOfFame />
        <TransitionBenefits />
        <RegisterSection />
      </main>
    </div>
  );
};

export default HomeQAtoBA;
