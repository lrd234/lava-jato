import { Droplets, Shield, Clock, Star, Users, MapPin } from 'lucide-react';

const features = [
  {
    icon: Droplets,
    title: 'Lavagem Profissional',
    description: 'Utilizamos técnicas e produtos de alta qualidade para garantir uma limpeza impecável.',
  },
  {
    icon: Shield,
    title: 'Produtos Premium',
    description: 'Trabalhamos apenas com produtos de primeira linha, seguros para a pintura do seu veículo.',
  },
  {
    icon: Clock,
    title: 'Agilidade',
    description: 'Respeitamos seu tempo. Serviços rápidos sem comprometer a qualidade.',
  },
  {
    icon: Star,
    title: 'Qualidade Garantida',
    description: 'Satisfação garantida ou refazemos o serviço. Sua confiança é nossa prioridade.',
  },
  {
    icon: Users,
    title: 'Equipe Especializada',
    description: 'Profissionais treinados e capacitados para cuidar do seu veículo.',
  },
  {
    icon: MapPin,
    title: 'Localização Privilegiada',
    description: 'Fácil acesso e estacionamento amplo para sua comodidade.',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que nos escolher?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Somos referência em estética automotiva, oferecendo serviços de excelência
            com foco total na satisfação do cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <feature.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
