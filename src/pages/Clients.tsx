
import React from 'react';
import { Users, Search, PlusCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientList from '@/components/clients/ClientList';

const Clients = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-plush-600" />
            <h1 className="text-2xl font-bold">Clientes</h1>
          </div>
          <Button>
            <PlusCircle className="mr-2" />
            Novo Cliente
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-9 max-w-md"
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>

        <ClientList />
      </div>
    </div>
  );
};

export default Clients;
