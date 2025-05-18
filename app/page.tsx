import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Empfehlungs-Link Service
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Einfach. Zuverlässig. Schnell.
          </p>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-6 text-xl font-medium">
            Finden Sie heraus, wie wir Ihnen helfen können
          </p>
          <Link
            href="https://sefrinconsulting.de"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Mehr erfahren <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <footer className="mt-24 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sefrin Consulting</p>
          <p className="mt-1">Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    </main>
  );
}
