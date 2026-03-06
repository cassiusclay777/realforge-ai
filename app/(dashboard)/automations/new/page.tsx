import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowLeft } from "lucide-react";

export default function NewAutomationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/automations">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na automatizace
          </Button>
        </Link>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Nová automatizace
          </CardTitle>
          <CardDescription>
            Formulář pro vytvoření nové automatizace připravujeme. Zatím můžete spouštět existující automatizace tlačítkem „Spustit nyní“.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/automations">
            <Button variant="outline">Zpět na seznam</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
