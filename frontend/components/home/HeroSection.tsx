import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-background to-secondary/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sprout className="h-4 w-4" />
              From Farm to Family
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Fresh from the Farm.
              <br />
              <span className="text-primary">Straight to Your Home.</span>
            </h1>
            <p className="mt-4 font-bangla text-lg text-muted-foreground sm:text-xl">
              খামার থেকে সরাসরি আপনার ঘরে
            </p>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Fresh from the farm, delivered to your home. UTHANO sources fresh
              fruits and agricultural products directly from Bangladeshi farms
              with complete traceability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg">
                  Shop Fresh
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/farms">
                <Button size="lg" variant="outline">
                  Explore Our Farms
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Sprout className="mx-auto h-24 w-24 text-primary" />
                  <p className="mt-4 text-2xl font-bold text-primary">
                    UTHANO
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From Farm to Family
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}