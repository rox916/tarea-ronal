import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataApi, Dataset } from "@/services/api";

export default function CleanData() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const queryClient = useQueryClient();

  // Fetch uploaded files (not from DB)
  const { data: uploadedFiles, isLoading: filesLoading } = useQuery({
    queryKey: ['uploaded-files'],
    queryFn: dataApi.getUploadedFiles,
  });

  // Clean data mutation
  const cleanMutation = useMutation({
    mutationFn: (filename: string) => dataApi.cleanFile(filename),
    onSuccess: (data) => {
      toast.success("Datos limpiados exitosamente");
      queryClient.invalidateQueries({ queryKey: ['uploaded-files'] });
      setIsCleaning(false);
      setCleaningProgress(100);
      // Show cleaning results
      toast.info(`Limpieza completada: ${data.cleaning_report?.duplicates_removed || 0} duplicados eliminados`);
    },
    onError: (error) => {
      toast.error("Error al limpiar datos");
      setIsCleaning(false);
    }
  });

  const cleaningSteps = [
    { name: "Valores Nulos", status: "completed", impact: "Alto" },
    { name: "Duplicados", status: "completed", impact: "Medio" },
    { name: "Normalización", status: isCleaning ? "in-progress" : "pending", impact: "Alto" },
    { name: "Outliers", status: "pending", impact: "Medio" },
  ];

  const dataQuality = [
    { metric: "Completitud", value: 95, color: "success" },
    { metric: "Consistencia", value: 88, color: "warning" },
    { metric: "Precisión", value: 92, color: "success" },
  ];

  const handleCleaning = () => {
    if (!selectedDataset) {
      toast.error("Selecciona un dataset para limpiar");
      return;
    }

    setIsCleaning(true);
    setCleaningProgress(0);
    setCurrentStep(0);
    
    toast.info("Iniciando limpieza de datos...");

    const stepMessages = [
      "Procesando valores nulos...",
      "Eliminando duplicados...",
      "Normalizando datos...",
      "Detectando outliers..."
    ];

    // Simular progreso mientras se ejecuta la limpieza real
    const interval = setInterval(() => {
      setCleaningProgress((prev) => {
        const newProgress = prev + 5;
        const stepIndex = Math.floor((newProgress / 100) * 4);
        
        if (stepIndex !== currentStep && stepIndex < 4) {
          setCurrentStep(stepIndex);
          toast.info(stepMessages[stepIndex]);
        }
        
        if (newProgress >= 90) {
          clearInterval(interval);
          // Ejecutar limpieza real
          cleanMutation.mutate(selectedDataset.filename);
          return 90;
        }
        return newProgress;
      });
    }, 180);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Limpieza de Datos</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Preprocesa y transforma tus datos para obtener mejores resultados
        </p>

        {/* File Selection */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Seleccionar Archivo para Limpiar</h3>
          {filesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando archivos...</span>
            </div>
          ) : uploadedFiles && uploadedFiles.length > 0 ? (
            <div className="grid gap-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.filename}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDataset?.filename === file.filename
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDataset(file)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{file.filename}</h4>
                      <p className="text-sm text-muted-foreground">
                        Tamaño: {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {selectedDataset?.filename === file.filename && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay archivos disponibles</p>
              <p className="text-sm text-muted-foreground">Ve a "Cargar Datos" para subir un archivo</p>
            </div>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pasos de Limpieza</h3>
            <div className="space-y-3">
              {cleaningSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {step.status === "completed" && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                    {step.status === "in-progress" && (
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                    {step.status === "pending" && (
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    )}
                    <span className="font-medium text-foreground">{step.name}</span>
                  </div>
                  <Badge
                    variant={step.impact === "Alto" ? "default" : "secondary"}
                  >
                    {step.impact}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleCleaning}
              disabled={isCleaning || !selectedDataset}
            >
              {isCleaning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Limpiando... {cleaningProgress}%
                </>
              ) : (
                "Ejecutar Limpieza"
              )}
            </Button>
            
            {isCleaning && (
              <div className="mt-4">
                <Progress value={cleaningProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Paso {currentStep + 1}/4
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Calidad de Datos</h3>
            <div className="space-y-4">
              {dataQuality.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.metric}</span>
                    <span className="text-sm font-bold text-primary">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Transformaciones Aplicadas
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <h4 className="font-semibold text-foreground">Normalización</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Escalado MinMax aplicado a todas las features numéricas
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Valores Nulos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                8 valores nulos rellenados con la media
              </p>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h4 className="font-semibold text-foreground">Outliers</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                3 outliers detectados y removidos
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
