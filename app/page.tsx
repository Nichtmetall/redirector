import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>URL-Weiterleitungs-Service</CardTitle>
          <CardDescription>
            Empfehlungs-Link Service von sefrinconsulting.de
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
