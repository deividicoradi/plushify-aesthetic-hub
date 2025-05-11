
import React from 'react';
import { DollarSign } from 'lucide-react';
import Pricing from '@/components/pricing/Pricing';

const Plans = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-12">
          <DollarSign className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Planos</h1>
        </div>
        
        <div className="pb-16">
          <Pricing />
        </div>
      </div>
    </div>
  );
};

export default Plans;
