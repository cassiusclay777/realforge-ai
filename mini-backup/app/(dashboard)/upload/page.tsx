"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpload } from "@/hooks/use-upload";
import { AlertCircle, CheckCircle, Image, Upload, Zap, Brain, Download } from "lucide-react";
import { useState, useRef } from "react";

// ProgressStep komponenta
const ProgressStep = ({ isActive, text }: { isActive: boolean; text: string }) => (
  <div className="flex items-center gap-3">
    <div className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-600"}`} />
    <span className={isActive ? "text-green-300" : "text-gray-400"}>{text}</span>
  </div>
);

// Sekce s bullet points
const Section = ({ title, color, items }: { title: string; color: "blue" | "purple" | "green"; items: string[] }) => {
  const colorMap = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500"
  };
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{title}</h4>
      <ul className="text-sm space-y-1 text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex items-start gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${colorMap[color]} mt-1.5`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Info panel komponenta
const InfoPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        Co AI udělá
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Section 
        title="📸 Photo Pipeline" 
        color="blue"
        items={[
          "Roztřídí fotky podle místností",
          "Odstraní rozmazané a tmavé snímky",
          "Vylepší barvy a světlo",
          "Vybere hlavní fotku"
        ]}
      />
      <Section 
        title="📝 Text Generation" 
        color="purple"
        items={[
          "Nadpis pro inzerát (60 znaků)",
          "Popis pro Sreality (250 znaků)",
          "SEO title a description",
          "Instagram a Facebook posty"
        ]}
      />
      <Section 
        title="🎯 Marketing" 
        color="green"
        items={[
          "Doporučená cena",
          "Cílové publikum",
          "Nejlepší čas na publikování"
        ]}
      />
      <div className="pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Zpracování trvá 1-3 minuty</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Cena zpracování: <span className="font-semibold">$0.002 / listing</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing">("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    type: "BYT",
    price: "",
    area: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadListing, isPending } = useUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
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
    
    // Check file type
    const acceptedTypes = ['.zip', '.7z', '.rar', '.ZIP', '.RAR'];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!acceptedTypes.includes(fileExt)) {
      alert(`Nepodporovaný typ souboru: ${fileExt}. Povolené typy: ${acceptedTypes.join(', ')}`);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startProgressSimulation = (listingId: string) => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            globalThis.location.href = `/listings/${listingId}`;
          }, 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleUploadSuccess = (data: any) => {
    console.log("✅ Upload successful:", data);
    setUploadState("processing");
    startProgressSimulation(data.listingId);
  };

  const handleUploadError = (error: any) => {
    console.error("❌ Upload failed:", error);
    setUploadState("idle");
    setProgress(0);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    alert(`Upload selhal: ${error.message || "Neznámá chyba"}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Prosím vyberte ZIP soubor");
      return;
    }

    if (!formData.title || !formData.address || !formData.price) {
      alert("Prosím vyplňte všechny povinné pole (Název, Adresa, Cena)");
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append('zipFile', selectedFile);
    submitFormData.append('title', formData.title);
    submitFormData.append('address', formData.address);
    submitFormData.append('type', formData.type);
    submitFormData.append('price', formData.price);
    if (formData.area) submitFormData.append('area', formData.area);

    setUploadState("uploading");
    setProgress(0);

    uploadListing(submitFormData, {
      onSuccess: handleUploadSuccess,
      onError: handleUploadError,
    });
  };

  // Check if form is valid for submit
  const isFormValid = selectedFile && formData.title && formData.address && formData.price;

  const renderUploadForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer group ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          name="zipFile"
          accept=".zip,.rar,.7z,.ZIP,.RAR"
          className="hidden"
          id="zipFile"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div className="cursor-pointer block">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
            isDragging ? 'bg-blue-200 dark:bg-blue-800' : 'bg-blue-100 dark:bg-blue-900'
          }`}>
            <Image className={`h-8 w-8 ${isDragging ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <p className="text-xl font-medium mb-2">
            {isDragging ? 'Pusť soubor zde' : 'Přetáhni ZIP sem nebo klikni pro výběr'}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedFile ? (
              <span className="font-medium text-green-600">✓ {selectedFile.name}</span>
            ) : (
              "Žádný soubor vybrán"
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Podporujeme: ZIP, RAR, 7z • Max 100MB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Název nemovitosti *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Byt 2+1, Praha 4, Škodovka 123"
            className="w-full border border-input bg-background px-3 py-2 rounded-md"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Adresa *
          </label>
          <input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Škodovka 123, Praha 4"
            className="w-full border border-input bg-background px-3 py-2 rounded-md"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Typ nemovitosti
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full border border-input bg-background px-3 py-2 rounded-md"
          >
            <option value="BYT">Byt</option>
            <option value="DUM">Dům</option>
            <option value="POZEMEK">Pozemek</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Cena (Kč) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="5000000"
            className="w-full border border-input bg-background px-3 py-2 rounded-md"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="area" className="text-sm font-medium">
            Plocha (m²)
          </label>
          <input
            id="area"
            name="area"
            type="number"
            step="0.1"
            value={formData.area}
            onChange={handleInputChange}
            placeholder="65"
            className="w-full border border-input bg-background px-3 py-2 rounded-md"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !isFormValid}
        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Nahrávám a zpracovávám...
          </>
        ) : (
          "Spustit AI zpracování"
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center">
        * Povinná pole. Po kliknutí na tlačítko začne nahrávání a AI zpracování.
      </div>
    </form>
  );

  const renderProcessingScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 text-white p-8 rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
          <span className="text-xl font-bold">Kováme váš listing… 🔨</span>
        </div>
        <span className="animate-pulse bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
          AI working...
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Průběh zpracování</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <ProgressStep 
          isActive={progress > 0} 
          text="Nahrávání ZIP souboru..." 
        />
        <ProgressStep 
          isActive={progress > 30} 
          text="Třídění fotek podle místností..." 
        />
        <ProgressStep 
          isActive={progress > 60} 
          text="Vylepšení barev a světla..." 
        />
        <ProgressStep 
          isActive={progress > 90} 
          text="Generování AI návrhů..." 
        />
      </div>

      {progress === 100 && (
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div>
            <p className="font-medium">Hotovo! Listing je připraven.</p>
            <p className="text-sm text-green-300">Za chvíli budete přesměrováni...</p>
          </div>
        </div>
      )}
    </div>
  );

  // Funkce pro AI zpracování existujícího ZIPu
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiComment, setAiComment] = useState('');
  const [aiResult, setAiResult] = useState<{ downloadUrl?: string; categories?: string[] } | null>(null);

  const handleAiProcess = async () => {
    if (!selectedFile) {
      alert('Prosím nejprve vyberte ZIP soubor');
      return;
    }

    setAiProcessing(true);
    setAiResult(null);

    try {
      const formData = new FormData();
      formData.append('zipFile', selectedFile);
      formData.append('comment', aiComment);

      const response = await fetch('/api/process-zip', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setAiResult({
          downloadUrl: result.downloadUrl,
          categories: result.categories,
        });
        alert('ZIP úspěšně zpracován AI! Můžete si stáhnout roztříděný soubor.');
      } else {
        throw new Error(result.error || 'Neznámá chyba');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      alert(`Chyba při zpracování: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
    } finally {
      setAiProcessing(false);
    }
  };

  const renderAiProcessingSection = () => (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Real-time AI zpracování ZIPu
        </CardTitle>
        <CardDescription>
          Okamžité roztřídění fotek podle místností s DeepSeek Vision AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedFile ? (
          <>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                ✓ Vybrán soubor: <span className="font-bold">{selectedFile.name}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="aiComment" className="text-sm font-medium">
                Komentář pro AI (volitelné)
              </label>
              <textarea
                id="aiComment"
                value={aiComment}
                onChange={(e) => setAiComment(e.target.value)}
                placeholder="Např.: 'Moderní byt s novou kuchyní, velký balkon, parkování v garáži'"
                className="w-full border border-input bg-background px-3 py-2 rounded-md min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                AI použije tento komentář pro generování popisků k fotkám
              </p>
            </div>

            {aiResult ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">ZIP úspěšně zpracován!</span>
                </div>
                
                {aiResult.categories && aiResult.categories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Roztříděné kategorie:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(aiResult.categories)).map((category, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult.downloadUrl && (
                  <a
                    href={aiResult.downloadUrl}
                    download="processed-photos.zip"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Stáhnout roztříděný ZIP
                  </a>
                )}
              </div>
            ) : (
              <Button
                onClick={handleAiProcess}
                disabled={aiProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {aiProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    AI zpracovává fotky...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Zpracuj AI (Real-time Vision)
                  </>
                )}
              </Button>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• AI analyzuje každou fotku a roztřídí ji podle místnosti</p>
              <p>• Vytvoří popisky pro realitní inzerát</p>
              <p>• Výstup: ZIP se složkami podle kategorií + popisky</p>
              <p>• Zpracování: 2-10 sekund na fotku</p>
            </div>
          </>
        ) : (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Nejprve nahrajte ZIP soubor výše pro AI zpracování
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Nahrej svůj nový listing 🏠</h1>
        <p className="text-xl text-muted-foreground">
          Nahraj ZIP s fotkami a AI vytvoří kompletní realitní inzerát
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Nahrát ZIP s fotkami
              </CardTitle>
              <CardDescription>
                Podporujeme JPG, PNG, ZIP (max 100MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadState === "idle" && renderUploadForm()}
              {(uploadState === "uploading" || uploadState === "processing") && renderProcessingScreen()}
            </CardContent>
          </Card>

          {renderAiProcessingSection()}
        </div>
        
        <InfoPanel />
      </div>
    </div>
  );
}