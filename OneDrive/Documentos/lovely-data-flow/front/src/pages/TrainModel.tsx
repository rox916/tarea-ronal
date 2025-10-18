import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Settings } from "lucide-react";
import { toast } from "sonner";
import { modelsApi, dataApi } from "@/services/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function TrainModel() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [epochs, setEpochs] = useState([10]);
  const [modelType, setModelType] = useState("neural-network");
  const [learningRate, setLearningRate] = useState("0.001");
  const [selectedDataset, setSelectedDataset] = useState<any>(null);

  // Fetch uploaded files (not from DB)
  const { data: uploadedFiles } = useQuery({
    queryKey: ['uploaded-files'],
    queryFn: dataApi.getUploadedFiles,
  });

  // Filter only cleaned files (files that have been processed)
  const cleanedFiles = uploadedFiles?.filter(file => 
    file.filename.startsWith('cleaned_') || 
    file.filename.includes('cleaned')
  ) || [];

  // Training mutation
  const trainMutation = useMutation({
    mutationFn: (data: any) => modelsApi.trainModelWithFile(data),
    onSuccess: (data) => {
      setIsTraining(false);
      setTrainingProgress(100);
      toast.success("Entrenamiento completado exitosamente");
      // Export to database after training
      toast.info("Modelo exportado a la base de datos");
    },
    onError: (error) => {
      setIsTraining(false);
      setTrainingProgress(0);
      toast.error("Error durante el entrenamiento");
    },
  });

  const handleTrain = () => {
    if (!selectedDataset) {
      toast.error("Selecciona un dataset limpio para entrenar.");
      return;
    }

    if (cleanedFiles.length === 0) {
      toast.error("No hay archivos limpios disponibles. Limpia un archivo primero.");
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    // Start training with selected file
    trainMutation.mutate({
      filename: selectedDataset.filename,
      model_type: modelType,
      target_column: "G3", // Usar columna real del dataset
      test_size: 0.2,
      parameters: {}
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Entrenar Modelo</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Configura parámetros y entrena tu modelo de Machine Learning
        </p>

        {/* Cleaned Files Selection */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Seleccionar Archivo Limpio</h3>
          {cleanedFiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay archivos limpios disponibles</p>
              <p className="text-sm text-muted-foreground">Ve a "Limpiar Datos" para procesar un archivo</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {cleanedFiles.map((file) => (
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
                      <div className="w-5 h-5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Configuración del Modelo</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="model-type" className="text-foreground mb-2 block">
                    Tipo de Modelo
                  </Label>
                  <Select value={modelType} onValueChange={setModelType}>
                    <SelectTrigger id="model-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neural-network">Red Neuronal (PyTorch)</SelectItem>
                      <SelectItem value="random-forest">Random Forest (Scikit-learn)</SelectItem>
                      <SelectItem value="svm">SVM (Scikit-learn)</SelectItem>
                      <SelectItem value="gradient-boost">Gradient Boosting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="optimizer" className="text-foreground mb-2 block">
                    Optimizador
                  </Label>
                  <Select defaultValue="adam">
                    <SelectTrigger id="optimizer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground">Épocas</Label>
                    <span className="text-sm font-medium text-primary">{epochs[0]}</span>
                  </div>
                  <Slider
                    value={epochs}
                    onValueChange={setEpochs}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="learning-rate" className="text-foreground mb-2 block">
                    Learning Rate
                  </Label>
                  <Select value={learningRate} onValueChange={setLearningRate}>
                    <SelectTrigger id="learning-rate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">0.1</SelectItem>
                      <SelectItem value="0.01">0.01</SelectItem>
                      <SelectItem value="0.001">0.001</SelectItem>
                      <SelectItem value="0.0001">0.0001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleTrain}
                disabled={isTraining || !selectedDataset}
                className="w-full mt-6"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {isTraining ? "Entrenando..." : "Iniciar Entrenamiento"}
              </Button>
            </Card>

            {isTraining && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Progreso del Entrenamiento
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progreso General</span>
                      <span className="text-sm font-bold text-primary">{trainingProgress}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Época Actual</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.floor((trainingProgress / 100) * epochs[0])} / {epochs[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Loss</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(0.5 - trainingProgress * 0.004).toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Dataset Split</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <span className="text-sm font-medium text-foreground">Entrenamiento</span>
                  <span className="text-sm font-bold text-primary">70%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                  <span className="text-sm font-medium text-foreground">Validación</span>
                  <span className="text-sm font-bold text-accent">15%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="text-sm font-medium text-foreground">Prueba</span>
                  <span className="text-sm font-bold text-success">15%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hardware</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dispositivo</span>
                  <span className="text-sm font-medium text-foreground">GPU</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Memoria</span>
                  <span className="text-sm font-medium text-foreground">8 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Batch Size</span>
                  <span className="text-sm font-medium text-foreground">32</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
