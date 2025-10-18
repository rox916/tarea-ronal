# Backend ML Pipeline

Backend funcional con FastAPI, pandas, numpy, scikit-learn, PyTorch y PostgreSQL con Supabase.

## Instalación

```bash
pip install -r requirements.txt
cp env.example .env
# Editar .env con tus credenciales de Supabase
python run.py
```

## Servidor

- **Puerto por defecto**: 8002
- **URL**: `http://localhost:8002`
- **Documentación**: `http://localhost:8002/docs`

## Flujo de Datos

1. **Cargar datos** → Solo se guarda en disco (no BD)
2. **Limpiar datos** → Procesa archivos del disco
3. **Entrenar modelo** → Entrena y DESPUÉS guarda en BD

## Endpoints

### 🔧 Utility
- `GET /` - Estado de la API
- `GET /health` - Health check

###  Data Management
- `POST /api/data/upload` - Subir archivo CSV
- `GET /api/data/uploaded-files` - Listar archivos subidos (sin BD)
- `GET /api/data/datasets` - Listar datasets de la BD
- `GET /api/data/datasets/{id}` - Obtener dataset específico
- `POST /api/data/analyze/{dataset_id}` - Analizar calidad de datos
- `POST /api/data/clean/{dataset_id}` - Limpiar datos de BD
- `POST /api/data/clean-file` - Limpiar archivo subido (sin BD)
- `GET /api/data/preview/{dataset_id}` - Vista previa de dataset
- `GET /api/data/preview-file/{filename}` - Vista previa de archivo

###  Machine Learning
- `POST /api/models/train` - Entrenar modelo con dataset de BD
- `POST /api/models/train-file` - Entrenar modelo con archivo
- `GET /api/models/model-types` - Tipos de modelos disponibles
- `GET /api/models/models` - Listar modelos entrenados
- `GET /api/models/models/{id}` - Obtener modelo específico
- `POST /api/models/{model_id}/export` - Exportar modelo

###  Results & Analytics
- `GET /api/results/metrics/{model_id}` - Métricas del modelo
- `GET /api/results/training-history/{model_id}` - Historial de entrenamiento
- `GET /api/results/confusion-matrix/{model_id}` - Matriz de confusión
- `GET /api/results/performance-comparison` - Comparación de rendimiento
- `GET /api/results/export/{model_id}` - Exportar resultados

###  Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/data-quality-summary` - Resumen de calidad
- `GET /api/dashboard/recent-activity` - Actividad reciente
- `GET /api/dashboard/model-performance` - Rendimiento de modelos

## Características

- ✅ **pandas y numpy** para procesamiento de datos
- ✅ **scikit-learn y PyTorch** para machine learning
- ✅ **PostgreSQL con Supabase** para base de datos
- ✅ **FastAPI** para API REST
- ✅ **Modo simulación** si no hay base de datos