import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Appointment, Service, Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Users,
  Car,
  LayoutDashboard,
  LogOut,
  Loader2,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  completed: { label: 'Concluído', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

type AppointmentWithDetails = Appointment & { 
  service: Service; 
  profile: Profile | null;
};

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalClients: 0,
    topService: '',
    totalRevenue: 0,
    completedCount: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

async function fetchData() {
    // Fetch appointments with service
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(*)
      `)
      .order('appointment_date', { ascending: false });

    // Fetch profiles separately
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*');

    const profilesMap = new Map<string, Profile>();
    if (profilesData) {
      profilesData.forEach(p => profilesMap.set(p.user_id, p as Profile));
    }

    if (appointmentsData) {
      const appointmentsWithProfiles = appointmentsData.map(a => ({
        ...a,
        profile: profilesMap.get(a.user_id) || null,
      })) as AppointmentWithDetails[];
      setAppointments(appointmentsWithProfiles);
    }

    // Fetch services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (servicesData) {
      setServices(servicesData as Service[]);
    }

    // Fetch clients
    const { data: clientsData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsData) {
      setClients(clientsData as Profile[]);
    }

    // Calculate stats
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAppts = appointmentsData?.filter(a => a.appointment_date === today) || [];
    
    const serviceCounts: Record<string, number> = {};
    appointmentsData?.forEach(a => {
      serviceCounts[a.service.name] = (serviceCounts[a.service.name] || 0) + 1;
    });
    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const completedAppts = appointmentsData?.filter(a => a.status === 'completed') || [];
    const totalRevenue = completedAppts.reduce((sum, a) => sum + (a.service?.price || 0), 0);

    setStats({
      totalAppointments: appointmentsData?.length || 0,
      todayAppointments: todayAppts.length,
      totalClients: clientsData?.length || 0,
      topService,
      totalRevenue,
      completedCount: completedAppts.length,
    });

    setIsLoading(false);
  }

  async function updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
      });
      return;
    }

    toast({
      title: 'Status atualizado',
      description: 'O agendamento foi atualizado com sucesso.',
    });

    fetchData();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <Loader2 className="w-8 h-8 animate-spin text-sidebar-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 rounded-lg accent-gradient">
            <Car className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold">
            AutoBrilho
          </span>
        </div>

        <nav className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie agendamentos, serviços e clientes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Agendamentos
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agendamentos Hoje
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Cadastrados
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Serviço Mais Popular
              </CardTitle>
              <Car className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{stats.topService}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento Total
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lavagens Concluídas
              </CardTitle>
              <Car className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="revenue">Faturamento</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
                <CardDescription>
                  Gerencie todos os agendamentos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.profile?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{appointment.service.name}</TableCell>
                        <TableCell>
                          {format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{appointment.start_time.slice(0, 5)}</TableCell>
                        <TableCell>{formatPrice(appointment.service.price)}</TableCell>
                        <TableCell>
                          <Badge variant={statusMap[appointment.status].variant}>
                            {statusMap[appointment.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => updateAppointmentStatus(appointment.id, value as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="confirmed">Confirmado</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
                <CardDescription>
                  Lista de serviços disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {service.description}
                        </TableCell>
                        <TableCell>{service.duration_minutes} min</TableCell>
                        <TableCell>{formatPrice(service.price)}</TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>
                  Lista de clientes cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
            <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>{(client as any).vehicle_model || '-'}</TableCell>
                        <TableCell>{(client as any).vehicle_color || '-'}</TableCell>
                        <TableCell>{(client as any).vehicle_plate || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(client.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Faturamento por Lavagem</CardTitle>
                <CardDescription>
                  Detalhamento das lavagens concluídas e valores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments
                      .filter(a => a.status === 'completed')
                      .map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.profile?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{appointment.service.name}</TableCell>
                          <TableCell>
                            {format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{formatPrice(appointment.service.price)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total de lavagens concluídas: {stats.completedCount}</span>
                  <span className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
