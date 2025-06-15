
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BenefitsSection from '../components/BenefitsSection';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { PlansSection } from '../components/home/PlansSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <BenefitsSection />
        <Features />
        <PlansSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
