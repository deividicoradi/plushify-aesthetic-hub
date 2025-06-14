
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const UpcomingAppointments = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/appointments');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          Sistema de agendamentos sendo recriado
        </div>
      </CardContent>
    </Card>
  );
};
