import React from 'react';
import { CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const benefits = [
    { text: '2× more relevant job matches' },
    { text: '50% more interview calls' },
    { text: 'Zero random applications' },
    { text: 'Focused on high-paying tech & remote roles' }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black transition-colors duration-300">
      {/* Left Side - Benefits */}
      <div className="lg:w-1/2 auth-gradient dark:bg-gradient-to-br dark:from-gray-900 dark:to-black p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center mb-8 lg:mb-12">
            <div className="w-10 h-10 bg-white/20 dark:bg-neon-green/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 border border-white/10 dark:border-neon-green/30">
              <span className="text-white font-bold text-lg">DRC</span>
            </div>
            <span className="text-white text-lg font-medium">Dheeraj Rathod Consult</span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Move Faster to Your Next Job{' '}
              <span className="text-white/90 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-neon-green dark:to-neon-emerald"> - We Apply, You Get Calls</span>
            </h1>

            {/* Benefits List */}
            <div className="space-y-4 mt-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 dark:bg-neon-green/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-white/10 dark:border-neon-green/30">
                    <CheckCircle className="w-5 h-5 text-white dark:text-neon-green" />
                  </div>
                  <span className="text-white/90">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-neon-green/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 dark:bg-neon-emerald/5 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-black transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 text-base transition-colors duration-300">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
