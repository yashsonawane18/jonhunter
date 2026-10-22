import React from 'react';
import { Linkedin, Instagram, Youtube, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] pt-14 pb-12 border-t border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          {/* Left: Brand */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
              <h3 className="text-base font-medium tracking-[-0.007em] text-[#fafafa]">
                JonHunter / Dheeraj Rathod Consult
              </h3>
            </div>
            <p className="text-xs text-[#898989] tracking-[-0.007em]">
              High-throughput deterministic job discovery and managed enterprise submissions.
            </p>
          </div>

          {/* Right: Socials */}
          <div className="flex items-center space-x-4 text-[#898989]">
            <a
              href="https://www.linkedin.com/company/dheerajrathodconsult"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="hover:text-[#3ecf8e] transition-colors p-2 rounded-full border border-[#2e2e2e] bg-[#181818]"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://www.instagram.com/dheerajrathodconsult/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="hover:text-[#3ecf8e] transition-colors p-2 rounded-full border border-[#2e2e2e] bg-[#181818]"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.youtube.com/@DheerajRathodConsult"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="YouTube"
              className="hover:text-[#3ecf8e] transition-colors p-2 rounded-full border border-[#2e2e2e] bg-[#181818]"
            >
              <Youtube size={18} />
            </a>
            <a
              href="https://www.facebook.com/DheerajRathodConsult"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="hover:text-[#3ecf8e] transition-colors p-2 rounded-full border border-[#2e2e2e] bg-[#181818]"
            >
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div className="border-t border-[#2e2e2e] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#898989] tracking-[-0.007em] gap-3">
          <p>&copy; {new Date().getFullYear()} Dheeraj Rathod Consult (DRC). All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>TERMINAL V2.0</span>
            <span>•</span>
            <span className="text-[#3ecf8e]">100% ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};