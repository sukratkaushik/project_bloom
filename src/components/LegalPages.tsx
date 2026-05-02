import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[24px] shadow-sm border border-border">
        <a href="#" className="inline-flex items-center gap-2 text-sage hover:text-sage-dark font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>
        <h1 className="font-serif text-4xl text-charcoal mb-6">Privacy Policy</h1>
        <div className="prose prose-sage max-w-none text-medium space-y-4">
          <p><strong>Last Updated:</strong> April 2026</p>
          <p>Welcome to Bloom. Your privacy is critically important to us, especially given the sensitive nature of pregnancy and health data. This Privacy Policy explains how we collect, use, and protect your information.</p>
          
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you use the Bloom app, including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, and authentication details via Google Sign-In.</li>
            <li><strong>Pregnancy Data:</strong> Due dates, calculation methods, and journey preferences.</li>
            <li><strong>Health & Wellness Data:</strong> Symptoms, vitals (blood pressure, weight), mood logs, and hydration tracking.</li>
            <li><strong>Tasks & Planning:</strong> Custom tasks, hospital bag items, and birth plan preferences.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">2. How We Store Your Data</h2>
          <p>Bloom uses a "local-first" architecture combined with secure cloud syncing:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Local Storage:</strong> Your data is primarily stored locally on your device for fast, offline access.</li>
            <li><strong>Cloud Sync:</strong> Data is securely synced to our cloud database (Firebase) to ensure it is backed up and accessible across your devices.</li>
            <li><strong>Security:</strong> We use strict security rules to ensure that only you (the authenticated user) can read or modify your personal data.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve the Bloom app. Your data is strictly used to provide the personalized tracking experience. We do not sell your personal data to third parties, and your health data is never used to train public AI models.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">4. Your Rights under Indian Law</h2>
          <p>In compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, you as a Data Principal have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Right to access and update:</strong> You may review and correct your data directly within the app.</li>
            <li><strong>Right to withdraw consent & erasure:</strong> You can choose to delete specific health logs or delete your entire account, which permanently erases your data from our systems.</li>
            <li><strong>Right to nominee:</strong> In the event of death or incapacity, you have the right to nominate someone to exercise these rights.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">5. Grievance Officer</h2>
          <p>In accordance with the <strong>Information Technology Act, 2000</strong> and the <strong>SPDI Rules, 2011</strong>, the name and contact details of the Grievance Officer are provided below. If you have any complaints or concerns regarding your data, please contact:</p>
          <div className="bg-sage-pale p-4 rounded-[12px] mt-4">
            <p className="font-semibold text-charcoal">Grievance Officer: Sukrat Kaushik</p>
            <p><strong>Email:</strong> grievance@bloompregnancy.in</p>
            <p><strong>Time:</strong> Mon-Fri (9:00 AM to 6:00 PM IST)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[24px] shadow-sm border border-border">
        <a href="#" className="inline-flex items-center gap-2 text-sage hover:text-sage-dark font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>
        <h1 className="font-serif text-4xl text-charcoal mb-6">Terms of Service</h1>
        <div className="prose prose-sage max-w-none text-medium space-y-4">
          <p><strong>Last Updated:</strong> April 2026</p>
          <p>Please read these Terms of Service carefully before using the Bloom app.</p>
          
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">1. Not Medical Advice</h2>
          <p className="font-semibold text-blush">CRITICAL DISCLAIMER: Bloom is a planning and tracking tool, not a medical device or a substitute for professional medical advice, diagnosis, or treatment.</p>
          <p>Always seek the advice of your physician, obstetrician, or other qualified health provider with any questions you may have regarding a medical condition or your pregnancy. Never disregard professional medical advice or delay in seeking it because of something you have read on the Bloom app.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">2. Acceptance of Terms & Eligibility</h2>
          <p>By accessing or using Bloom, you agree to be bound by these Terms. Under the <strong>Indian Contract Act, 1872</strong>, you must be at least 18 years of age to form a binding contract. If you are under 18, you may not use this service independently.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">3. User Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password or credentials that you use to access the service.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">4. Acceptable Use</h2>
          <p>You agree not to use the app in any way that causes, or may cause, damage to the app or impairment of the availability or accessibility of the app.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">5. Governing Law & Jurisdiction</h2>
          <p>These Terms shall be governed by and construed in accordance with the <strong>laws of India</strong>. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">6. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes.</p>
        </div>
      </div>
    </div>
  );
};
