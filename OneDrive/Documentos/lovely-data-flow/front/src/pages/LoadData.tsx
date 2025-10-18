import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { dataApi, Dataset } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export default function LoadData() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch uploaded files (not from DB)
  const { data: uploadedFiles, isLoading: filesLoading } = useQuery({
    queryKey: ['uploaded-files'],
    queryFn: dataApi.getUploadedFiles,
  });

  // Fetch data preview
  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ['file-preview', currentDataset?.filename],
    queryFn: () => currentDataset ? dataApi.getFilePreview(currentDataset.filename) : Promise.resolve({ preview: [] }),
    enabled: !!currentDataset,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: dataApi.uploadFile,
    onSuccess: (data) => {
      setCurrentDataset({ 
        id: data.filename, // Use filename as ID for files
        filename: data.filename,
        path: data.saved_path,
        size: 0, // Will be updated
        modified: Date.now()
      });
      setDataLoaded(true);
      setIsLoading(false);
      setLoadingProgress(100);
      toast.success(`Dataset cargado exitosamente - ${data.data_info.rows} filas procesadas`);
      queryClient.invalidateQueries({ queryKey: ['uploaded-files'] });
    },
    onError: (error) => {
      setIsLoading(false);
      setLoadingProgress(0);
      toast.error("Error al cargar el dataset");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setFileName(file.name);
    handleUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = (file: File) => {
    setIsLoading(true);
    setLoadingProgress(0);
    toast.info("Cargando dataset...");

    // Simulate progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 150);

    // Upload file
    uploadMutation.mutate(file);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Cargar Datos</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Importa tus datasets para comenzar el análisis
        </p>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Cargando Dataset...
                </h3>
                <p className="text-muted-foreground mb-6">
                  Procesando y validando datos de {fileName}
                </p>
                <div className="w-full max-w-md space-y-2">
                  <Progress value={loadingProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">{loadingProgress}% completado</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Vista Previa (Cargando...)
              </h3>
              <div className="rounded-lg border overflow-hidden opacity-70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Feature 1</TableHead>
                      <TableHead>Feature 2</TableHead>
                      <TableHead>Feature 3</TableHead>
                      <TableHead>Feature 4</TableHead>
                      <TableHead>Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          <TableCell className="font-medium">...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      previewData?.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{row.feature1}</TableCell>
                          <TableCell>{row.feature2}</TableCell>
                          <TableCell>{row.feature3}</TableCell>
                          <TableCell>{row.feature4}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {row.target}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        ) : !dataLoaded ? (
          <Card className="p-12 border-dashed border-2 hover:border-primary transition-colors cursor-pointer" onClick={handleButtonClick}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Arrastra tus archivos aquí o haz clic para seleccionar
              </h3>
              <p className="text-muted-foreground mb-6">
                Soporta archivos CSV (máximo 20MB)
              </p>
              <Button onClick={handleButtonClick} size="lg" disabled={isLoading}>
                Seleccionar Archivo CSV
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 bg-success/5 border-success">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-semibold text-foreground">{currentDataset?.nombre_archivo || fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentDataset ? `Estado: ${currentDataset.estado_procesamiento}` : 'Cargando...'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Vista Previa de Datos</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Feature 1</TableHead>
                      <TableHead>Feature 2</TableHead>
                      <TableHead>Feature 3</TableHead>
                      <TableHead>Feature 4</TableHead>
                      <TableHead>Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          <TableCell className="font-medium">...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                          <TableCell>...</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      previewData?.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{row.feature1}</TableCell>
                          <TableCell>{row.feature2}</TableCell>
                          <TableCell>{row.feature3}</TableCell>
                          <TableCell>{row.feature4}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {row.target}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Total Registros</h4>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {uploadMutation.data?.data_info?.rows || 0}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold text-foreground">Features</h4>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {uploadMutation.data?.data_info?.columns ? uploadMutation.data.data_info.columns - 1 : 0}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-success" />
                  <h4 className="font-semibold text-foreground">Clases</h4>
                </div>
                <p className="text-3xl font-bold text-foreground">3</p>
              </Card>
            </div>
          </div>
        )}

        {/* Archivos subidos */}
        {!isLoading && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Archivos Subidos</h3>
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
                      currentDataset?.filename === file.filename
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setCurrentDataset(file)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{file.filename}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tamaño: {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {currentDataset?.filename === file.filename && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay archivos subidos</p>
                <p className="text-sm text-muted-foreground">Sube un archivo CSV para comenzar</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
