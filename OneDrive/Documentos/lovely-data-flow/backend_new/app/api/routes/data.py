from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.data_processing import DataProcessor
from app.database import db
from typing import List, Dict, Any
import os
import logging
import traceback
from pathlib import Path
from app.services.ml_models import MLModelsService

router = APIRouter()

class CleanFileRequest(BaseModel):
    filename: str

# configure a simple logger for this module (will be harmless if the app configures logging)
logger = logging.getLogger("app.api.routes.data")
if not logger.handlers:
    # basic config: write to a logs file under project root
    logs_dir = Path.cwd() / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(logs_dir / "server.log")
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    # also add a stdout handler for immediate console visibility
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
    logger.setLevel(logging.INFO)

@router.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    """Subir datos CSV (solo guardar en disco, NO en BD hasta entrenar)"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo archivos CSV")
    
    try:
        content = await file.read()
        processor = DataProcessor()
        data_info = processor.load_csv(content, file.filename)

        # Guardar el archivo en disco (carpeta uploads/)
        uploads_dir = Path.cwd() / "uploads"
        uploads_dir.mkdir(parents=True, exist_ok=True)
        saved_path = uploads_dir / file.filename
        with open(saved_path, "wb") as f:
            f.write(content)

        # NO guardar en BD todavía - solo devolver info del archivo
        logger.info(f"Archivo '{file.filename}' subido y guardado en {saved_path}")
        return {
            "message": "✅ Datos subidos correctamente",
            "data_info": data_info,
            "saved_path": str(saved_path),
            "filename": file.filename
        }

    except Exception as e:
        # Log completo para facilitar debugging
        tb = traceback.format_exc()
        logger.error(f"Error en upload_data: {e}\n{tb}")
        # En modo DEBUG devolver la traza en la respuesta para facilitar debugging local
        if os.getenv("DEBUG", "0") == "1":
            raise HTTPException(status_code=500, detail={"error": str(e), "traceback": tb})
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {e}")


def _resolve_dataset_path(raw_path: str) -> str:
    """Resolve a dataset path stored in DB. Accepts absolute paths or relative paths like '/uploads/file.csv' or 'uploads/file.csv'."""
    # If already exists, return
    if os.path.exists(raw_path):
        return raw_path

    # Strip leading slash and try relative to cwd
    candidate = raw_path.lstrip('/\\')
    candidate_path = Path.cwd() / candidate
    if candidate_path.exists():
        return str(candidate_path)

    # Try as-is (maybe windows drive path with leading /)
    alt = raw_path.lstrip('/')
    if os.path.exists(alt):
        return alt

    # Not found — return original so caller can raise a clear error
    return raw_path


@router.get("/datasets")
async def get_datasets():
    """Obtener todos los datasets almacenados"""
    query = """
    SELECT id, nombre_archivo, tipo_archivo, estado_procesamiento, created_at, user_id
    FROM datasets
    ORDER BY created_at DESC
    """
    try:
        datasets = db.execute_query(query)
        return [dict(dataset) for dataset in datasets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar datasets: {e}")

@router.get("/uploaded-files")
async def get_uploaded_files():
    """Obtener archivos subidos (sin BD)"""
    try:
        uploads_dir = Path.cwd() / "uploads"
        if not uploads_dir.exists():
            return []
        
        files = []
        for file_path in uploads_dir.glob("*.csv"):
            if file_path.is_file():
                files.append({
                    "filename": file_path.name,
                    "path": str(file_path),
                    "size": file_path.stat().st_size,
                    "modified": file_path.stat().st_mtime
                })
        
        return sorted(files, key=lambda x: x["modified"], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar archivos: {e}")



@router.post("/analyze/{dataset_id}")
async def analyze_data_quality(dataset_id: str):
    """Analizar calidad de datos de un dataset"""
    try:
        # Obtener información del dataset desde la base de datos
        query = """
        SELECT ruta_almacenamiento, nombre_archivo
        FROM datasets
        WHERE id = %s
        """
        datasets = db.execute_query(query, (dataset_id,))
        
        if not datasets:
            raise HTTPException(status_code=404, detail="Dataset no encontrado")
        
        dataset = dict(datasets[0])
        file_path = _resolve_dataset_path(dataset["ruta_almacenamiento"])
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado en el servidor: {file_path}")
        processor = DataProcessor()
        processor.load_csv_from_path(file_path)
        
        # Analizar calidad real de los datos
        quality_metrics = processor.analyze_data_quality()
        
        # Guardar métricas en la base de datos
        insert_quality_query = """
        INSERT INTO data_quality (dataset_id, completeness, consistency, accuracy, null_values, duplicates, outliers)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        quality_params = (
            dataset_id,
            quality_metrics["completeness"],
            quality_metrics["consistency"],
            quality_metrics["accuracy"],
            quality_metrics["null_values"],
            quality_metrics["duplicates"],
            quality_metrics["outliers"]
        )
        db.execute_insert(insert_quality_query, quality_params)
        
        return quality_metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clean/{dataset_id}")
async def clean_data(dataset_id: str):
    """Limpiar datos de un dataset"""
    try:
        # Obtener información del dataset desde la base de datos
        query = """
        SELECT ruta_almacenamiento, nombre_archivo
        FROM datasets
        WHERE id = %s
        """
        datasets = db.execute_query(query, (dataset_id,))
        
        if not datasets:
            raise HTTPException(status_code=404, detail="Dataset no encontrado")
        
        dataset = dict(datasets[0])
        file_path = _resolve_dataset_path(dataset["ruta_almacenamiento"])
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado en el servidor: {file_path}")
        processor = DataProcessor()
        processor.load_csv_from_path(file_path)
        cleaning_report = processor.clean_data()
        
        # Guardar datos limpios en un nuevo archivo
        import uuid
        cleaned_filename = f"cleaned_{uuid.uuid4()}.csv"
        cleaned_path = f"uploads/{cleaned_filename}"
        
        # Guardar datos limpios
        cleaned_data = processor.get_cleaned_data()
        cleaned_data.to_csv(cleaned_path, index=False)
        
        # Actualizar estado del dataset
        update_query = """
        UPDATE datasets 
        SET estado_procesamiento = 'LIMPIO', ruta_almacenamiento = %s
        WHERE id = %s
        """
        db.execute_update(update_query, (cleaned_path, dataset_id))
        
        return cleaning_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clean-file")
async def clean_uploaded_file(request: dict):
    """Limpiar datos de un archivo subido (sin BD)"""
    filename = request.get("filename")
    if not filename:
        raise HTTPException(status_code=400, detail="filename is required")
    try:
        file_path = Path.cwd() / "uploads" / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {filename}")
        
        # Cargar y limpiar datos
        processor = DataProcessor()
        processor.load_csv_from_path(str(file_path))
        cleaning_report = processor.clean_data()
        
        # Guardar datos limpios
        import uuid
        cleaned_filename = f"cleaned_{uuid.uuid4()}.csv"
        cleaned_path = Path.cwd() / "uploads" / cleaned_filename
        
        cleaned_data = processor.get_cleaned_data()
        cleaned_data.to_csv(cleaned_path, index=False)
        
        return {
            "message": "✅ Datos limpiados correctamente",
            "cleaning_report": cleaning_report,
            "cleaned_file": cleaned_filename,
            "cleaned_path": str(cleaned_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview/{dataset_id}")
async def get_data_preview(dataset_id: str, limit: int = 10):
    """Obtener vista previa de un dataset"""
    try:
        # Obtener información del dataset desde la base de datos
        query = """
        SELECT ruta_almacenamiento, nombre_archivo
        FROM datasets
        WHERE id = %s
        """
        datasets = db.execute_query(query, (dataset_id,))
        
        if not datasets:
            raise HTTPException(status_code=404, detail="Dataset no encontrado")
        
        dataset = dict(datasets[0])
        file_path = _resolve_dataset_path(dataset["ruta_almacenamiento"])
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado en el servidor: {file_path}")
        import pandas as pd
        data = pd.read_csv(file_path)
        
        # Devolver vista previa real
        preview_data = data.head(limit).to_dict('records')
        
        return preview_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en preview: {str(e)}")

@router.get("/preview-file/{filename}")
async def get_file_preview(filename: str, limit: int = 10):
    """Obtener vista previa de un archivo subido (sin BD)"""
    try:
        file_path = Path.cwd() / "uploads" / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {filename}")
        
        import pandas as pd
        data = pd.read_csv(file_path)
        
        # Devolver vista previa real
        preview_data = data.head(limit).to_dict('records')
        
        return {
            "filename": filename,
            "rows": len(data),
            "columns": len(data.columns),
            "preview": preview_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en preview: {str(e)}")


@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Obtener un dataset específico"""
    query = """
    SELECT id, nombre_archivo, tipo_archivo, estado_procesamiento, created_at, user_id
    FROM datasets
    WHERE id = %s
    """
    try:
        datasets = db.execute_query(query, (dataset_id,))
        if not datasets:
            raise HTTPException(status_code=404, detail="Dataset no encontrado")
        return dict(datasets[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar dataset: {e}")
