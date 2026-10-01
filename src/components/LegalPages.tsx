import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { navigate } from '../utils/navigation';
import { PublicHeader } from './PublicHeader';

export const PrivacyPolicy: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      }).catch((err) => {
        console.error("Could not copy email: ", err);
      });
    } else {
      try {
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal">
      <Helmet>
        <title>Privacy Policy | Our Pregnancy</title>
        <meta name="description" content="Read our Privacy Policy to understand how we protect your data at Our Pregnancy." />
        <link rel="canonical" href="https://ourpregnancy.in/privacy" />
      </Helmet>
      <PublicHeader />
      <div className="pt-32 pb-16 px-4 sm:px-6 md:px-12 relative z-10">
        {toastMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-charcoal text-white px-4 py-2 rounded-lg shadow-lg text-[13px] font-medium animate-in fade-in slide-in-from-top-4">
            {toastMessage}
          </div>
        )}
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[24px] shadow-sm border border-border">
          <h1 className="font-serif text-4xl text-charcoal mb-6">Privacy Policy</h1>
          <div className="prose prose-sage max-w-none text-medium space-y-4">
          <p><strong>Last Updated:</strong> September 2026</p>
          <p>Welcome to Our Pregnancy. Your privacy is critically important to us, especially given the sensitive nature of pregnancy and health data. This Privacy Policy explains how we collect, use, and protect your information.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you use the Our Pregnancy app, including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, and authentication details via Google Sign-In.</li>
            <li><strong>Pregnancy Data:</strong> Due dates, calculation methods, and journey preferences.</li>
            <li><strong>Health & Wellness Data:</strong> Symptoms, vitals (blood pressure, weight), mood logs, and hydration tracking.</li>
            <li><strong>Tasks & Planning:</strong> Custom tasks, hospital bag items, and birth plan preferences.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">2. How We Store Your Data</h2>
          <p>Our Pregnancy stores your data in your browser's local storage for offline access, and automatically syncs it to secure cloud storage when you are signed in — so you can access it across devices.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Browser Storage:</strong> Data is saved locally in your browser (IndexedDB) so the app works even without an internet connection. Note: clearing your browser data will erase locally stored data.</li>
            <li><strong>Cloud Sync:</strong> When signed in, data is securely synced to our cloud database, backed up and accessible from any device.</li>
            <li><strong>Security:</strong> We use strict security rules to ensure that only you (the authenticated user) can read or modify your personal data.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve the Our Pregnancy app. Your data is strictly used to provide the personalized tracking experience. We do not sell your personal data to third parties, and your health data is never used to train public AI models.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">4. How We Share Your Data</h2>
          <p>We do not sell, rent, or trade your personal or health data. To deliver our services, we route necessary data through trusted third-party service providers solely to perform essential application functions:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Cloud hosting and database storage:</strong> Your account information and encrypted tracking logs are stored with a cloud infrastructure provider, not on our own physical servers.</li>
            <li><strong>AI processing:</strong> When you use AI-powered features (Bloom AI chat assistant, food safety scanner, and medical report analysis), the photos, documents, or health text you submit are sent to a third-party AI service to generate a response. This data is not used to train public AI models.</li>
            <li><strong>Payment processing:</strong> If you subscribe to a paid plan, your payment transaction is handled by a third-party payment processor. We do not collect or store your payment card details or banking credentials ourselves.</li>
            <li><strong>Email delivery:</strong> Transactional communications (such as welcome emails, account notifications, plan updates, and payment receipts) are transmitted through a cloud email delivery service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">5. Your Data Rights</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Right to access and update:</strong> You may review and correct your data directly within the app.</li>
            <li><strong>Right to withdraw consent & erasure:</strong> You can choose to delete specific health logs or delete your entire account, which permanently erases your data from our systems.</li>
            <li><strong>Right to nominee:</strong> You have the right to nominate someone to exercise these rights on your behalf.</li>
          </ul>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">6. Strict Prohibition of Fetal Sex Determination (PCPNDT Act, 1994)</h2>
          <p>In strict accordance with the <strong>Pre-Conception and Pre-Natal Diagnostic Techniques (Prohibition of Sex Selection) Act, 1994 (PCPNDT Act)</strong>, prenatal determination or disclosure of the sex/gender of a fetus is strictly illegal in India. Our Pregnancy does not provide, support, predict, or reveal fetal gender or sex under any circumstances across its tracking algorithms, AI assistants, OCR document scanners, or checklist milestones. Any inquiries or automated inputs attempting fetal sex identification are strictly blocked and prohibited on our platform.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">7. Grievance Representative</h2>
          <p>If you have any complaints or concerns regarding your data, please contact our support and grievance representative:</p>
          <div className="bg-sage-pale p-4 rounded-[12px] mt-4">
            <p className="font-semibold text-charcoal">Representative: Sukrat Kaushik</p>
            <p><strong>Email:</strong> <a href="mailto:grievance@ourpregnancy.in" onClick={(e) => handleEmailClick("grievance@ourpregnancy.in", e)} className="hover:text-sage-dark text-sage font-semibold transition-colors">grievance@ourpregnancy.in</a></p>
            <p><strong>Time:</strong> Mon-Fri (9:00 AM to 6:00 PM)</p>
          </div>
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
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal">
      <Helmet>
        <title>Terms of Service | Our Pregnancy</title>
        <meta name="description" content="Read our Terms of Service at Our Pregnancy." />
        <link rel="canonical" href="https://ourpregnancy.in/terms" />
      </Helmet>
      <PublicHeader />
      <div className="pt-32 pb-16 px-4 sm:px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[24px] shadow-sm border border-border">
          <h1 className="font-serif text-4xl text-charcoal mb-6">Terms of Service</h1>
        <div className="prose prose-sage max-w-none text-medium space-y-4">
          <p><strong>Last Updated:</strong> April 2026</p>
          <p>Please read these Terms of Service carefully before using the Our Pregnancy app.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">1. Not Medical Advice</h2>
          <p className="font-semibold text-blush">CRITICAL DISCLAIMER: Our Pregnancy is a planning and tracking tool, not a medical device or a substitute for professional medical advice, diagnosis, or treatment.</p>
          <p>Always seek the advice of your physician, obstetrician, or other qualified health provider with any questions you may have regarding a medical condition or your pregnancy. Never disregard professional medical advice or delay in seeking it because of something you have read on the Our Pregnancy app.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">2. Acceptance of Terms & Eligibility</h2>
          <p>By accessing or using Our Pregnancy, you agree to be bound by these Terms. You must be at least 18 years of age to form a binding contract and use this service independently.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">3. User Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password or credentials that you use to access the service.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">4. Acceptable Use</h2>
          <p>You agree not to use the app in any way that causes, or may cause, damage to the app or impairment of the availability or accessibility of the app.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">5. Prohibition of Fetal Sex Determination (PCPNDT Act, 1994)</h2>
          <p className="font-semibold text-blush">STRICT LEGAL PROHIBITION: Under Indian Law (The Pre-Conception and Pre-Natal Diagnostic Techniques - PCPNDT Act, 1994), prenatal sex determination or disclosure of fetal sex/gender is strictly prohibited and constitutes a criminal offense.</p>
          <p>You agree not to use Our Pregnancy, its AI assistants, milestone planners, or document analysis tools to determine, predict, or seek information regarding the sex of an unborn fetus. Our Pregnancy strictly complies with the PCPNDT Act, 1994, and reserves the right to terminate access for any user violating these provisions.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">6. Governing Law & Jurisdiction</h2>
          <p>These Terms shall be governed by and construed in accordance with the applicable laws. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts.</p>

          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-4">7. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes.</p>
        </div>
      </div>
    </div>
    </div>
  );
};
