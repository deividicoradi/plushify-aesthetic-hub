
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BenefitsSection from '../components/BenefitsSection';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { PlansSection } from '../components/home/PlansSection';
import { WhatsAppFloatingChat } from '../components/whatsapp/WhatsAppFloatingChat';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <BenefitsSection />
        <Features />
        <div id="planos">
          <PlansSection />
        </div>
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppFloatingChat />
    </div>
  );
};

export default Index;
