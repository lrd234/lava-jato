import { useEffect, useState } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Servicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (data) {
        setServices(data as Service[]);
      }
      setIsLoading(false);
    }

    fetchServices();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="hero-gradient py-20">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Serviços Profissionais</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Nossos Serviços
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              Conheça nossa linha completa de serviços de estética automotiva.
              Qualidade e excelência em cada detalhe.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-background">
          <div className="container">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando serviços...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="card-gradient border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="font-display text-xl text-foreground">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duração: {formatDuration(service.duration_minutes)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </span>
                      <Button variant="accent" asChild>
                        <Link to={`/agendar?service=${service.id}`}>
                          Agendar
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
