import React from 'react';
import { Linkedin, Instagram, Youtube, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
          {/* Left Section: Logo & Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Dheeraj Rathod Consult (DRC)
              </h3>
            </div>

            {/* <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">
                Information
              </h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div> */}
          </div>

          {/* Right Section: Socials */}
          <div className="flex items-center space-x-6 text-gray-400">
            <a
              href="https://www.linkedin.com/company/dheerajrathodconsult"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-neon-green transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <Linkedin size={24} />
            </a>
            <a
              href="https://www.instagram.com/dheerajrathodconsult/"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-neon-green transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://www.youtube.com/@DheerajRathodConsult"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-neon-green transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <Youtube size={24} />
            </a>
            <a
              href="https://www.facebook.com/DheerajRathodConsult"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-neon-green transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <Facebook size={24} />
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Dheeraj Rathod Consult (DRC). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};