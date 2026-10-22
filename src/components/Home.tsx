import React from 'react';
import { SiteIntegration } from './home/SiteIntegration';
import { Testimonials } from './home/Testimonials';
import { SmarterWay } from './home/SmarterWay';
import { ProofSection } from './home/ProofSection';
import { VideoTestimonials } from './home/VideoTestimonials';
import { ComparisonTable } from './home/ComparisonTable';
import { FAQ } from './home/FAQ';
import { InstagramStories } from './home/InstagramStories';

interface HomeProps {
  onGetStarted?: () => void;           // navigates to signup/login
  onNavigateToQAtoBA?: () => void;     // navigates to qa-to-ba page
  onNavigateToPricing?: () => void;    // navigates to pricing page
  onNavigateToDiscover?: () => void;   // navigates to discover page
}

const Home: React.FC<HomeProps> = ({
  onGetStarted,
  onNavigateToQAtoBA,
  onNavigateToPricing,
  onNavigateToDiscover,
}) => {
  const handleNavigateToQAtoBA = () => {
    onNavigateToQAtoBA?.();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#fafafa] selection:bg-[#3ecf8e] selection:text-[#121212]">
      <main>
        <SiteIntegration
          onNavigateToSignup={onGetStarted}
          onNavigateToQAtoBA={handleNavigateToQAtoBA}
          onNavigateToDiscover={onNavigateToDiscover}
        />

        <ProofSection />
        
        <SmarterWay />

        <ComparisonTable />

        <VideoTestimonials />
        
        <Testimonials />
        
        <InstagramStories />
        
        <FAQ />
      </main>
    </div>
  );
};

export default Home;