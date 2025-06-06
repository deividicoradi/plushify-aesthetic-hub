
import React from "react";

export const BannerAside = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-card p-6 shadow-lg border border-border animate-fade-in delay-200">
      <img
        src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=600&q=80"
        alt="Nail art design"
        className="w-full h-[360px] object-cover object-center rounded-xl shadow-lg mb-6 border border-border"
        loading="lazy"
        draggable={false}
      />
      <h2 className="text-2xl font-serif font-bold mb-3 text-primary">
        Mantenha seu estoque organizado
      </h2>
      <p className="text-muted-foreground">
        Gerencie seus produtos com facilidade, monitore o estoque e mantenha seu salão 
        sempre abastecido com os melhores produtos para suas clientes.
      </p>
    </div>
  );
};
