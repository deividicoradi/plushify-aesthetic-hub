
import React from 'react';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Como Aumentar a Retenção de Clientes em 2024",
      excerpt: "Estratégias comprovadas para fidelizar clientes e aumentar o faturamento do seu negócio de estética.",
      author: "Maria Oliveira",
      date: "15 de Janeiro, 2024",
      readTime: "5 min",
      category: "Marketing",
      featured: true
    },
    {
      id: 2,
      title: "Tendências em Estética para o Ano",
      excerpt: "As principais tendências e tratamentos que estão dominando o mercado de estética atualmente.",
      author: "Ana Silva",
      date: "12 de Janeiro, 2024",
      readTime: "7 min",
      category: "Tendências"
    },
    {
      id: 3,
      title: "Gestão Financeira: Controlando Custos e Aumentando Lucros",
      excerpt: "Dicas práticas para organizar as finanças do seu negócio e maximizar a rentabilidade.",
      author: "Carlos Santos",
      date: "10 de Janeiro, 2024",
      readTime: "6 min",
      category: "Gestão"
    },
    {
      id: 4,
      title: "Marketing Digital para Esteticistas: Guia Completo",
      excerpt: "Como usar as redes sociais e marketing digital para atrair mais clientes para sua clínica.",
      author: "João Costa",
      date: "8 de Janeiro, 2024",
      readTime: "8 min",
      category: "Marketing"
    }
  ];

  const categories = ["Todos", "Marketing", "Gestão", "Tendências", "Tecnologia"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-plush-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Blog <span className="gradient-text">Plushify</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Conteúdo especializado para profissionais de estética que querem fazer seus negócios prosperarem.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map((category) => (
            <Button 
              key={category} 
              variant={category === "Todos" ? "default" : "outline"}
              className={category === "Todos" ? "bg-plush-600 hover:bg-plush-700" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className={`card-hover ${post.featured ? 'border-plush-200 shadow-lg' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-plush-100 text-plush-700" variant="secondary">
                    {post.category}
                  </Badge>
                  {post.featured && (
                    <Badge className="bg-gradient-to-r from-plush-600 to-purple-600 text-white">
                      Destaque
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-3 hover:text-plush-600 transition-colors cursor-pointer">
                  {post.title}
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-foreground/60">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-plush-600 hover:bg-plush-700">
                    Ler mais <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-plush-600 hover:bg-plush-700">
            Ver todos os posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
