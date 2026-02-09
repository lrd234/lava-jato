import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg accent-gradient">
                <Car className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                AutoBrilho
              </span>
            </Link>
            <p className="text-secondary-foreground/70 text-sm">
              Excelência em estética automotiva. Seu carro merece o melhor tratamento.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link to="/agendar" className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors">
                  Agendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                <Phone className="w-4 h-4 text-accent" />
                (79) 99999-1279
              </li>
              <li className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                <Mail className="w-4 h-4 text-accent" />
                contato@autobrilho.com
              </li>
              <li className="flex items-start gap-2 text-sm text-secondary-foreground/70">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />
                <span>Av. Principal, 1000<br />Centro - Aracaju/SE</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display font-semibold mb-4">Horário de Funcionamento</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                <Clock className="w-4 h-4 text-accent" />
                Seg - Sex: 08:00 - 18:00
              </li>
              <li className="text-sm text-secondary-foreground/70 ml-6">
                Sábado: 08:00 - 14:00
              </li>
              <li className="text-sm text-secondary-foreground/70 ml-6">
                Domingo: Fechado
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} AutoBrilho. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
