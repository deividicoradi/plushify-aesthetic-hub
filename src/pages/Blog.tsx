import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "Como otimizar o agendamento do seu salão",
    description: "Dicas práticas para melhorar a eficiência dos agendamentos e reduzir o tempo de espera dos clientes.",
    author: "Equipe Plushify",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Gestão",
    image: "/lovable-uploads/ff398e71-2a2a-4da0-9e55-7039622dc732.png"
  },
  {
    id: 2,
    title: "Tendências em gestão de salões para 2024",
    description: "Descubra as principais tendências tecnológicas que estão transformando o mercado de beleza.",
    author: "Ana Silva",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Tendências",
    image: "/lovable-uploads/ff398e71-2a2a-4da0-9e55-7039622dc732.png"
  },
  {
    id: 3,
    title: "Fidelização de clientes: estratégias que funcionam",
    description: "Como criar um programa de fidelidade eficaz e manter seus clientes sempre voltando.",
    author: "Carlos Mendes",
    date: "2024-01-05",
    readTime: "6 min",
    category: "Marketing",
    image: "/lovable-uploads/ff398e71-2a2a-4da0-9e55-7039622dc732.png"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Blog Plushify
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Dicas, tendências e insights para profissionais da beleza e estética
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span>{post.author}</span>
                    <Calendar className="w-4 h-4 ml-4 mr-2" />
                    <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Mais conteúdo em breve!
          </h2>
          <p className="text-muted-foreground mb-6">
            Estamos preparando mais artigos úteis para você
          </p>
          <Button variant="outline">
            Inscrever-se para atualizações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Blog;