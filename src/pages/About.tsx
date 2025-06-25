
import React from 'react';
import Navbar from '../components/Navbar';
import AboutHero from '../components/about/AboutHero';
import AboutStory from '../components/about/AboutStory';
import AboutMission from '../components/about/AboutMission';
import AboutValues from '../components/about/AboutValues';
import AboutCommitments from '../components/about/AboutCommitments';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <AboutHero />
      <AboutStory />
      
      <AboutMission />
      
      {/* Nossos Valores section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <AboutValues />
        </div>
      </section>

      <AboutCommitments />
    </div>
  );
};

export default About;
