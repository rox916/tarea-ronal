import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Award, Target, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resultsApi, modelsApi } from "@/services/api";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function Results() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  // Fetch models
  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getModels,
  });

  // Fetch model metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['model-metrics', selectedModelId],
    queryFn: () => selectedModelId ? resultsApi.getModelMetrics(selectedModelId) : Promise.resolve(null),
    enabled: !!selectedModelId,
  });

  // Fetch training history
  const { data: trainingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['training-history', selectedModelId],
    queryFn: () => selectedModelId ? resultsApi.getTrainingHistory(selectedModelId) : Promise.resolve([]),
    enabled: !!selectedModelId,
  });

  // Fetch confusion matrix
  const { data: confusionMatrix, isLoading: matrixLoading } = useQuery({
    queryKey: ['confusion-matrix', selectedModelId],
    queryFn: () => selectedModelId ? resultsApi.getConfusionMatrix(selectedModelId) : Promise.resolve(null),
    enabled: !!selectedModelId,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (modelId: number) => modelsApi.exportModel(modelId),
    onSuccess: (data) => {
      setIsExporting(false);
      setExportProgress(100);
      toast.success("Modelo exportado exitosamente");
    },
    onError: (error) => {
      setIsExporting(false);
      setExportProgress(0);
      toast.error("Error al exportar el modelo");
    },
  });

  const handleExport = () => {
    if (!selectedModelId) {
      toast.error("Selecciona un modelo para exportar");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    toast.info("Preparando exportación...");

    // Simulate progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 8;
      });
    }, 120);

    // Start export
    exportMutation.mutate(selectedModelId);
  };

  // Set first model as selected by default
  if (models && models.length > 0 && !selectedModelId) {
    setSelectedModelId(models[0].id);
  }
  const metricsData = metrics ? [
    { name: "Precision", value: Math.round(metrics.precision * 100) },
    { name: "Recall", value: Math.round(metrics.recall * 100) },
    { name: "F1-Score", value: Math.round(metrics.f1_score * 100) },
    { name: "Accuracy", value: Math.round(metrics.accuracy * 100) },
  ] : [];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Resultados del Modelo</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Análisis de rendimiento y métricas de evaluación
        </p>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Accuracy</h3>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {metricsLoading ? '...' : `${Math.round((metrics?.accuracy || 0) * 100)}%`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {metricsLoading ? 'Cargando...' : 'Métricas actualizadas'}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-success flex items-center justify-center">
                <Target className="w-5 h-5 text-success-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Precision</h3>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {metricsLoading ? '...' : `${Math.round((metrics?.precision || 0) * 100)}%`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {metricsLoading ? 'Cargando...' : 'Excelente balance'}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">F1-Score</h3>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {metricsLoading ? '...' : `${Math.round((metrics?.f1_score || 0) * 100)}%`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {metricsLoading ? 'Cargando...' : 'Muy consistente'}
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Métricas de Evaluación</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Historial de Entrenamiento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trainingHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Matriz de Confusión</h3>
          {matrixLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Cargando matriz de confusión...</p>
            </div>
          ) : confusionMatrix ? (
          <div className="grid grid-cols-4 gap-2 max-w-2xl">
            <div className="col-span-1"></div>
              {confusionMatrix.class_labels?.map((label: string, index: number) => (
                <div key={index} className="text-center font-semibold text-sm text-foreground">{label}</div>
              ))}
              
              {confusionMatrix.class_labels?.map((label: string, rowIndex: number) => (
                <div key={rowIndex}>
                  <div className="text-right pr-3 font-semibold text-sm text-foreground">{label}</div>
                  {confusionMatrix.confusion_matrix[rowIndex]?.map((value: number, colIndex: number) => (
                    <div 
                      key={colIndex}
                      className={`p-4 rounded-lg text-center font-bold ${
                        rowIndex === colIndex 
                          ? 'bg-success/20 border-2 border-success' 
                          : value > 0 
                            ? 'bg-destructive/20' 
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay datos de matriz de confusión disponibles</p>
          </div>
          )}
        </Card>

        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Exportar Modelo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Descarga el modelo entrenado en formato pickle
              </p>
            </div>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Exportando... {exportProgress}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Exportar Modelo
                </>
              )}
            </Button>
          </div>
          {isExporting && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Generando archivo...</span>
                <span className="text-sm font-medium text-primary">{exportProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
