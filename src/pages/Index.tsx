import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
