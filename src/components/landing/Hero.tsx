import { Button } from '@/components/ui/button';
import { Car, Sparkles, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] hero-gradient overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[90vh] py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Lava Jato Premium</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up max-w-4xl">
          Seu carro merece o{' '}
          <span className="text-gradient">melhor tratamento</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Serviços profissionais de lavagem e estética automotiva. 
          Agende online e garanta o brilho que seu veículo merece.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button variant="hero" size="xl" asChild>
            <Link to="/agendar">
              Agendar Agora
            </Link>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <Link to="/servicos">
              Ver Serviços
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 text-primary-foreground/80">
            <div className="p-2 rounded-lg bg-accent/20">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm font-medium">Agendamento Online</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/80">
            <div className="p-2 rounded-lg bg-accent/20">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm font-medium">Produtos Premium</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/80">
            <div className="p-2 rounded-lg bg-accent/20">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm font-medium">Profissionais Qualificados</span>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
}
