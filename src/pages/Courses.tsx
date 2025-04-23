
import React from "react";
import { Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COURSES = [
  {
    title: "Introdução à Programação",
    description:
      "Aprenda os fundamentos da programação e desenvolva seu primeiro software. Ideal para quem está começando!",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    title: "UX/UI Design Moderno",
    description:
      "Descubra técnicas de design que encantam usuários e impulsionam resultados digitais.",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Marketing Digital",
    description:
      "Domine estratégias para atrair clientes e criar campanhas eficazes nas redes sociais.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Gestão de Projetos",
    description:
      "Aprenda a planejar, organizar e liderar equipes rumo ao sucesso de qualquer projeto.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  },
];

const Courses = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-8">
      {/* Hero/Banner */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center gap-3 animate-fade-in">
          <Book className="w-10 h-10 text-plush-600" />
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif gradient-text tracking-tight">
            Cursos Exclusivos
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl font-medium animate-fade-in delay-100">
          Aprenda novas habilidades com nossos cursos criados por especialistas e fique à frente no mercado. Metodologia prática, conteúdos atualizados e suporte premium.
        </p>
      </div>
      {/* Lista de Cursos */}
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course, idx) => (
            <Card
              key={course.title}
              className={`group relative card-hover p-0 rounded-2xl overflow-hidden border-0 shadow-xl hover:shadow-2xl bg-white dark:bg-card transition-all duration-300 ${
                course.featured
                  ? "md:col-span-2 row-span-2 lg:row-auto lg:col-span-1 border-4 border-plush-200"
                  : ""
              }`}
            >
              <div className="h-48 md:h-52 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 scale-100 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Destaque se for featured */}
                {course.featured && (
                  <span className="absolute top-4 left-4 bg-plush-600 text-white px-3 py-1 text-xs rounded-full shadow font-bold animate-pulse-soft">
                    Recomendado
                  </span>
                )}
              </div>
              <CardHeader className="p-5 pb-2 bg-gradient-to-b from-white/90 via-white/80 to-accent2-50 dark:from-card dark:via-card dark:to-accent2-950">
                <CardTitle className="text-xl font-bold font-serif group-hover:text-plush-700 transition-colors">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex flex-col gap-4">
                <p className="text-base text-muted-foreground mb-3 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <Button
                    variant="default"
                    className="font-semibold transition-all duration-200 gradient-bg hover:brightness-110 px-5 py-2 rounded-full text-base"
                  >
                    Ver detalhes
                  </Button>
                  {/* Badge animado */}
                  <div className="ml-2 text-xs font-bold text-accent2-600 bg-accent2-100 px-2 py-1 rounded-xl animate-fade-in">
                    {idx === 0 ? "Novo" : idx === 1 ? "Pop" : "Favorito"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Seção institucional */}
      <div className="max-w-4xl mx-auto mt-16 mb-4 rounded-2xl p-8 bg-gradient-to-tr from-plush-50 via-accent2-50 to-white/70 text-center glass-morphism shadow-lg">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2 text-plush-600">Por que estudar com a gente?</h2>
        <p className="text-base md:text-lg max-w-3xl mx-auto text-muted-foreground">
          Nossos cursos combinam teoria e prática, com apoio de especialistas, acesso vitalício ao conteúdo e uma comunidade exclusiva para networking e aprendizado contínuo.
        </p>
      </div>
    </div>
  );
};

export default Courses;
