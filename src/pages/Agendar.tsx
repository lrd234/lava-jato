import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { supabase } from '@/lib/supabase';
import type { Service, BlockedSlot } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parse, isAfter, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function Agendar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (data) {
        setServices(data as Service[]);
        const serviceId = searchParams.get('service');
        if (serviceId) {
          const found = data.find(s => s.id === serviceId);
          if (found) {
            setSelectedService(found as Service);
            setStep(2);
          }
        }
      }
      setIsLoading(false);
    }

    fetchServices();
  }, [searchParams]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  async function fetchAvailability() {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('appointment_date', dateStr)
      .in('status', ['pending', 'confirmed']);

    if (appointments) {
      setBookedSlots(appointments.map(a => a.start_time.slice(0, 5)));
    }

    const { data: blocked } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('blocked_date', dateStr);

    if (blocked) {
      setBlockedSlots(blocked as BlockedSlot[]);
    }
  }

  const isSlotAvailable = (time: string) => {
    if (bookedSlots.includes(time)) return false;

    const fullDayBlocked = blockedSlots.some(b => b.is_full_day);
    if (fullDayBlocked) return false;

    const timeBlocked = blockedSlots.some(b => {
      if (!b.start_time || !b.end_time) return false;
      return time >= b.start_time.slice(0, 5) && time < b.end_time.slice(0, 5);
    });

    return !timeBlocked;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para agendar.',
      });
      navigate('/login');
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    const startTime = selectedTime;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + selectedService.duration_minutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      service_id: selectedService.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao agendar',
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Agendamento realizado!',
      description: 'Você receberá a confirmação em breve.',
    });

    navigate('/dashboard');
  };

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

  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 30),
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 bg-background">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Agendar Serviço
              </h1>
              <p className="text-muted-foreground">
                Escolha o serviço, data e horário de sua preferência
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      step >= s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className={cn(
                    'text-sm hidden sm:inline',
                    step >= s ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>
                    {s === 1 ? 'Serviço' : s === 2 ? 'Data' : 'Horário'}
                  </span>
                  {s < 3 && <div className="w-8 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>

            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-lg',
                      selectedService?.id === service.id
                        ? 'ring-2 ring-primary'
                        : 'hover:border-primary/50'
                    )}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="font-display">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatDuration(service.duration_minutes)}</span>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 2: Select Date */}
            {step === 2 && selectedService && (
              <div className="flex flex-col items-center">
                <Card className="mb-4 w-full max-w-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      Selecione a Data
                    </CardTitle>
                    <CardDescription>
                      Serviço: {selectedService.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) setStep(3);
                      }}
                      disabled={disabledDays}
                      locale={ptBR}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
                <Button variant="ghost" onClick={() => { setStep(1); setSelectedService(null); }}>
                  ← Voltar para serviços
                </Button>
              </div>
            )}

            {/* Step 3: Select Time */}
            {step === 3 && selectedService && selectedDate && (
              <div className="flex flex-col items-center">
                <Card className="mb-4 w-full max-w-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Selecione o Horário
                    </CardTitle>
                    <CardDescription>
                      {selectedService.name} - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const available = isSlotAvailable(time);
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            disabled={!available}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              !available && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {selectedTime && (
                  <Card className="mb-4 w-full max-w-md bg-muted/50">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Resumo do Agendamento</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Serviço:</strong> {selectedService.name}</p>
                        <p><strong>Data:</strong> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        <p><strong>Horário:</strong> {selectedTime}</p>
                        <p><strong>Valor:</strong> {formatPrice(selectedService.price)}</p>
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant="accent"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Agendando...
                          </>
                        ) : (
                          'Confirmar Agendamento'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Button variant="ghost" onClick={() => { setStep(2); setSelectedTime(null); }}>
                  ← Voltar para data
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
