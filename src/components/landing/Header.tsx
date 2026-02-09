import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/servicos', label: 'Serviços' },
    { href: '/agendar', label: 'Agendar' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg accent-gradient">
            <Car className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            AutoBrilho
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || 'Minha Conta'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {isAdmin ? 'Painel Admin' : 'Meu Painel'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button variant="accent" asChild>
                <Link to="/cadastro">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-effect border-t border-border/50">
          <nav className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium py-2 ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
              {user ? (
                <>
                  <Button variant="outline" asChild className="justify-start">
                    <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {isAdmin ? 'Painel Admin' : 'Meu Painel'}
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="justify-start text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button variant="accent" asChild>
                    <Link to="/cadastro" onClick={() => setIsMobileMenuOpen(false)}>
                      Cadastrar
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
