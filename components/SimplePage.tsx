import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

interface SimplePageProps {
  title: string;
  type: 'privacy' | 'terms';
  onBack: () => void;
}

const SimplePage: React.FC<SimplePageProps> = ({ title, type, onBack }) => {
  return (
    <div className="min-h-screen bg-[#050510] text-slate-300 font-inter animate-fade-in relative bg-grid-pattern">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-mono text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          RETURN TO BASE
        </button>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
              {type === 'privacy' ? (
                <Shield className="w-8 h-8 text-cyan-400" />
              ) : (
                <FileText className="w-8 h-8 text-cyan-400" />
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{title}</h1>
          </div>

          <div className="prose prose-invert prose-slate max-w-none space-y-6">
            <p className="text-lg leading-relaxed text-slate-400">
              Last updated: May 20, 2025. Welcome to Grid Balancer. By accessing or using our simulation, you agree to be bound by these terms.
            </p>

            <h3 className="text-xl font-bold text-white mt-8">1. Introduction</h3>
            <p>
              Grid Balancer is a simulation game developed by Vicky Kumar. This document outlines the rules, regulations, and privacy practices regarding your use of our application.
            </p>

            <h3 className="text-xl font-bold text-white mt-8">2. {type === 'privacy' ? 'Data Collection' : 'User Conduct'}</h3>
            <p>
              {type === 'privacy' 
                ? "We respect your privacy. This application does not collect personal identifiable information (PII) without your consent. We may use local storage to save your game progress and settings locally on your device."
                : "Users agree to use the application for entertainment purposes only. Any attempt to reverse engineer, hack, or disrupt the service is strictly prohibited."}
            </p>

            <h3 className="text-xl font-bold text-white mt-8">3. {type === 'privacy' ? 'Cookies' : 'Intellectual Property'}</h3>
            <p>
              {type === 'privacy'
                ? "We use minimal cookies necessary for the functioning of the application. No third-party tracking cookies are employed for advertising purposes."
                : "All content, visual assets, and code are the intellectual property of Vicky Kumar and Devil Labs, unless otherwise stated (e.g., open source libraries)."}
            </p>
            
            <h3 className="text-xl font-bold text-white mt-8">4. Contact</h3>
            <p>
              For any questions regarding this {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}, please contact us at <a href="mailto:themvaplatform@gmail.com" className="text-cyan-400 hover:underline">themvaplatform@gmail.com</a>.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-600 font-mono">
             &copy; 2025 VICKY KUMAR. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePage;