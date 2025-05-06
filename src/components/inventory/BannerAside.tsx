
import React from "react";

export const BannerAside = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-white/90 p-6 shadow-lg glass-morphism animate-fade-in delay-200">
      <img
        src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=600&q=80"
        alt="Nail art design"
        className="w-full h-[360px] object-cover object-center rounded-xl shadow-lg mb-6"
        loading="lazy"
        draggable={false}
      />
      <h2 className="text-2xl font-serif font-bold mb-3 text-pink-600">
        Mantenha seu estoque organizado
      </h2>
      <p className="text-gray-600">
        Gerencie seus produtos com facilidade, monitore o estoque e mantenha seu salão 
        sempre abastecido com os melhores produtos para suas clientes.
      </p>
    </div>
  );
};
