import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Car, Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(20).optional().or(z.literal('')),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  vehicleModel: z.string().trim().min(1, 'Informe o modelo do veículo').max(100),
  vehicleColor: z.string().trim().min(1, 'Informe a cor do veículo').max(50),
  vehiclePlate: z.string().trim().min(7, 'Placa inválida').max(10),
});

export default function Cadastro() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem.',
      });
      setIsLoading(false);
      return;
    }

    const validation = signupSchema.safeParse({ fullName, email, phone, password, vehicleModel, vehicleColor, vehiclePlate });
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          vehicle_model: vehicleModel.trim(),
          vehicle_color: vehicleColor.trim(),
          vehicle_plate: vehiclePlate.trim().toUpperCase(),
        },
      },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Cadastro realizado!',
      description: 'Verifique seu email para confirmar sua conta.',
    });

    navigate('/login');
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg accent-gradient">
              <Car className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              AutoBrilho
            </span>
          </Link>
          <CardTitle className="font-display text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se para agendar seus serviços
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="João da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Modelo do Veículo</Label>
                <Input
                  id="vehicleModel"
                  type="text"
                  placeholder="Ex: Civic, Corolla"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Cor</Label>
                <Input
                  id="vehicleColor"
                  type="text"
                  placeholder="Ex: Preto, Branco"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Placa</Label>
              <Input
                id="vehiclePlate"
                type="text"
                placeholder="ABC1D23"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                required
                disabled={isLoading}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
