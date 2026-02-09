import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Appointment, Service } from '@/lib/supabase';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Plus, Loader2, Car } from 'lucide-react';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  completed: { label: 'Concluído', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

export default function Dashboard() {
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<(Appointment & { service: Service })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  async function fetchAppointments() {
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(*)
      `)
      .eq('user_id', user!.id)
      .order('appointment_date', { ascending: false });

    if (data) {
      setAppointments(data as (Appointment & { service: Service })[]);
    }
    setIsLoading(false);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(a => 
    ['pending', 'confirmed'].includes(a.status) && 
    new Date(a.appointment_date) >= new Date(new Date().toDateString())
  );

  const pastAppointments = appointments.filter(a => 
    a.status === 'completed' || 
    new Date(a.appointment_date) < new Date(new Date().toDateString())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 bg-background">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Olá, {profile?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus agendamentos
              </p>
            </div>
            <Button variant="accent" asChild>
              <Link to="/agendar">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Link>
            </Button>
          </div>

          {/* Upcoming Appointments */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Próximos Agendamentos
            </h2>
            {upcomingAppointments.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="py-12 text-center">
                  <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você não tem agendamentos próximos
                  </p>
                  <Button variant="accent" asChild>
                    <Link to="/agendar">Agendar Agora</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-display text-lg">
                          {appointment.service.name}
                        </CardTitle>
                        <Badge variant={statusMap[appointment.status].variant}>
                          {statusMap[appointment.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(appointment.appointment_date), "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.start_time.slice(0, 5)}</span>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <span className="font-semibold text-primary">
                            {formatPrice(appointment.service.price)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Histórico
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastAppointments.slice(0, 6).map((appointment) => (
                  <Card key={appointment.id} className="shadow-card opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-display text-lg">
                          {appointment.service.name}
                        </CardTitle>
                        <Badge variant={statusMap[appointment.status].variant}>
                          {statusMap[appointment.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
