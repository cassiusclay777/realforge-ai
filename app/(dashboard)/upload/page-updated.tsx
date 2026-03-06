"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useState, useRef } from "react";
import { Upload, Zap, Image, CheckCircle, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OneClickUploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    propertyType: "HOUSE",
    location: "",
    price: "",
    publishNow: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Prosím nahrajte ZIP soubor');
      return;
    }
    
    setSelectedFile(file);
    setStep(2);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Prosím nahrajte ZIP soubor');
      return;
    }
    
    setSelectedFile(file);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.description) {
      alert('Vyplňte popis a nahrajte ZIP');
      return;
    }
    
    setIsProcessing(true);
    setStep(3);
    
    // Simulace progressu
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 1000);
    
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('description', formData.description);
      form.append('propertyType', formData.propertyType);
      form.append('location', formData.location);
      form.append('price', formData.price);
      form.append('publishNow', String(formData.publishNow));
      
      const response = await fetch('/api/one-click', {
        method: 'POST',
        body: form
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJobId(data.jobId);
        setStatus('processing');
        
        // Polling pro kontrolu stavu
        const checkInterval = setInterval(async () => {
          const statusResponse = await fetch(`/api/one-click?jobId=${data.jobId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            clearInterval(checkInterval);
            setProgress(100);
            setStatus('completed');
            
            setTimeout(() => {
              router.push(`/listings/${statusData.listingId}`);
            }, 2000);
          }
        }, 3000);
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('Chyba:', error);
      setStatus('error');
      setProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 One-Click AI Listing</h1>
        <p className="text-muted-foreground">
          Nahrajte fotky, napište popis a nechte AI udělat zbytek
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex justify-between mb-8">
        {[
          { num: 1, label: "Nahrát fotky" },
          { num: 2, label: "Popis nemovitosti" },
          { num: 3, label: "AI zpracování" }
        ].map((s) => (
          <div key={s.num} className="flex-1 text-center">
            <div className={`
              w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center
              ${step > s.num ? 'bg-green-500 text-white' : 
                step === s.num ? 'bg-blue-500 text-white' : 
                'bg-gray-200 text-gray-500'}
            `}>
              {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
            </div>
            <div className="text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>📸 Nahrát fotky nemovitosti</CardTitle>
            <CardDescription>
              Nahrajte ZIP soubor s fotkami (klidně i horší kvality, AI je vyčistí)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".zip"
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                Klikněte nebo přetáhněte ZIP sem
              </p>
              <p className="text-sm text-muted-foreground">
                Podporováno: .zip (max 100MB)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>📝 Popište nemovitost</CardTitle>
              <CardDescription>
                Čím víc informací dáte, tím lepší popis AI vytvoří
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Popis nemovitosti *</Label>
                <Textarea
                  id="description"
                  placeholder="Např.: Prodej rodinného domu 3+1 se zahradou v klidné části města. Dům po částečné rekonstrukci, nová střecha, plynový kotel. Zahrada 500m2 s bazénem..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Typ nemovitosti</Label>
                  <select
                    id="propertyType"
                    className="w-full p-2 border rounded-md"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  >
                    <option value="HOUSE">Rodinný dům</option>
                    <option value="APARTMENT">Byt</option>
                    <option value="COMMERCIAL">Komerční</option>
                    <option value="LAND">Pozemek</option>
                    <option value="COTTAGE">Chata</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokalita</Label>
                  <Input
                    id="location"
                    placeholder="např. Praha 5"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Cena (Kč)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="4500000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex items-center gap-2 pb-2">
                    <Switch
                      id="publishNow"
                      checked={formData.publishNow}
                      onCheckedChange={(checked) => setFormData({...formData, publishNow: checked})}
                    />
                    <Label htmlFor="publishNow">Publikovat rovnou na Poski</Label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg">
                  Spustit AI zpracování
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>🤖 AI zpracovává vaši nemovitost</CardTitle>
            <CardDescription>
              Tento proces trvá obvykle 1-3 minuty
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full h-2" />
            
            <div className="space-y-2">
              {[
                "Analýza fotek a detekce místností",
                "Odstranění nekvalitních a duplicitních fotek",
                "Generování nadpisu a popisu",
                "Tvorba SEO metadat",
                "Příprava pro publikaci"
              ].map((step, i) => {
                const stepProgress = (i + 1) * 20;
                return (
                  <div key={i} className="flex items-center gap-2">
                    {progress >= stepProgress ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={progress >= stepProgress ? "text-gray-900" : "text-gray-400"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {status === 'completed' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Hotovo! Přesměrovávám na detail nemovitosti...
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Došlo k chybě při zpracování. Zkuste to prosím znovu.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info panel */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Image className="h-4 w-4" />
              Analýza fotek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              AI roztřídí místnosti, odstraní rozmazané a duplicitní fotky, vybere hlavní
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Generování textů
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Nadpis, popis pro Sreality, SEO metadata, sociální sítě
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" />
              Automatická publikace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Rovnou publikuje na Poski, Sreality a další portály
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
