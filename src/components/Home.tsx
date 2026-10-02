import React from 'react';
import { SiteIntegration } from './home/SiteIntegration';
import { Testimonials } from './home/Testimonials';
import { SmarterWay } from './home/SmarterWay';
import { ProofSection } from './home/ProofSection';
import { VideoTestimonials } from './home/VideoTestimonials';
import { ComparisonTable } from './home/ComparisonTable';
import { FAQ } from './home/FAQ';
import { InstagramStories } from './home/InstagramStories';
import { SuccessStoriesSection } from './home/SuccessStoriesSection';

interface HomeProps {
  onGetStarted?: () => void;           // navigates to signup/login
  onNavigateToQAtoBA?: () => void;     // navigates to qa-to-ba page
  onNavigateToPricing?: () => void;    // navigates to pricing page
}

const Home: React.FC<HomeProps> = ({
  onGetStarted,
  onNavigateToQAtoBA,
  onNavigateToPricing,
}) => {
  const handleNavigateToQAtoBA = () => {
    onNavigateToQAtoBA?.();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white selection:bg-neon-green selection:text-black transition-colors duration-300">
      <main>
        <SiteIntegration
          onNavigateToSignup={onGetStarted}
          onNavigateToQAtoBA={handleNavigateToQAtoBA}
        />

        <VideoTestimonials />
        
        <SmarterWay />
        <ProofSection />
        <Testimonials />
        <InstagramStories />
        {/* <SuccessStoriesSection /> */}
        <ComparisonTable />
        <FAQ />
      </main>
    </div>
  );
};

export default Home;