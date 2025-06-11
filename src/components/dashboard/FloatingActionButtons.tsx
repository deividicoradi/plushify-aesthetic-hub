
import React, { useState } from 'react';
import { Plus, Calendar, Users, Package, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const FloatingActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: Calendar,
      label: 'Novo Agendamento',
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/appointments')
    },
    {
      icon: Users,
      label: 'Adicionar Cliente',
      color: 'from-green-500 to-green-600',
      onClick: () => navigate('/clients')
    },
    {
      icon: Package,
      label: 'Gerenciar Estoque',
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/inventory')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {action.label}
            </div>
            <Button
              size="icon"
              className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r ${action.color} border-0 hover:scale-110`}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              <action.icon className="w-5 h-5 text-white" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        className={`w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 border-0 hover:scale-110 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
};
