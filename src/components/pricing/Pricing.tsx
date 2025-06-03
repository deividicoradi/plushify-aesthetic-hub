
import React, { useEffect } from 'react';
import { PricingHeader } from './PricingHeader';
import { PricingPlans } from './PricingPlans';
import { ComparisonTable } from './ComparisonTable';

const Pricing = () => {
  useEffect(() => {
    console.log('💰 Pricing component mounted successfully');
  }, []);

  console.log('🔄 Pricing component rendering...');

  return (
    <section className="py-20" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PricingHeader />
        <PricingPlans />
        <ComparisonTable />
      </div>
    </section>
  );
};

export default Pricing;
