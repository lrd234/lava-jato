import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Services() {
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

  if (isLoading) {
    return (
      <section id="servicos" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossos Serviços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Carregando serviços...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicos" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Qualidade Garantida</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nossos Serviços
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferecemos uma gama completa de serviços para deixar seu veículo impecável.
            Escolha o que melhor atende às suas necessidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.id} 
              className="group card-gradient border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                  {service.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatDuration(service.duration_minutes)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(service.price)}
                </span>
                <Button variant="accent" size="sm" asChild>
                  <Link to={`/agendar?service=${service.id}`}>
                    Agendar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
