from fastapi import APIRouter, HTTPException
from app.services.ml_models import MLModelsService
from typing import List, Dict, Any

router = APIRouter()
ml_service = MLModelsService()

@router.post("/train")
async def train_model(
    dataset_id: str,
    model_type: str,
    target_column: str,
    epochs: int = 10,
    learning_rate: float = 0.001,
    test_size: float = 0.2,
    parameters: Dict = None
):
    """Entrenar un modelo de ML con datos reales"""
    try:
        # Verificar que el dataset existe y está limpio
        from app.database import db
        query = """
        SELECT estado_procesamiento, ruta_almacenamiento
        FROM datasets
        WHERE id = %s
        """
        datasets = db.execute_query(query, (dataset_id,))
        
        if not datasets:
            raise HTTPException(status_code=404, detail="Dataset no encontrado")
        
        dataset = dict(datasets[0])
        if dataset["estado_procesamiento"] not in ["LIMPIO", "SUBIDO"]:
            raise HTTPException(status_code=400, detail="Dataset debe estar limpio antes del entrenamiento")
        
        # Entrenar modelo con datos reales
        model_result = ml_service.train_model(
            dataset_path=dataset["ruta_almacenamiento"],
            model_type=model_type,
            target_column=target_column,
            test_size=test_size,
            parameters=parameters or {}
        )
        
        # Actualizar estado del dataset
        update_query = """
        UPDATE datasets 
        SET estado_procesamiento = 'MODELO_ENTRENADO'
        WHERE id = %s
        """
        db.execute_update(update_query, (dataset_id,))
        
        return model_result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_models():
    """Obtener todos los modelos entrenados"""
    return ml_service.get_models()

@router.get("/models/{model_id}")
async def get_model_by_id(model_id: str):
    """Obtener un modelo específico por ID"""
    model = ml_service.trained_models.get(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")
    return model

@router.post("/train-file")
async def train_model_with_file(
    filename: str,
    model_type: str,
    target_column: str,
    test_size: float = 0.2,
    parameters: Dict = None
):
    """Entrenar un modelo con un archivo subido (sin BD)"""
    try:
        from pathlib import Path
        
        file_path = Path.cwd() / "uploads" / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {filename}")
        
        # Entrenar modelo con archivo real
        model_result = ml_service.train_model(
            dataset_path=str(file_path),
            model_type=model_type,
            target_column=target_column,
            test_size=test_size,
            parameters=parameters or {}
        )
        
        # Guardar en BD después del entrenamiento exitoso
        import uuid
        from app.database import db
        
        dataset_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        insert_query = """
        INSERT INTO datasets (id, nombre_archivo, tipo_archivo, estado_procesamiento, ruta_almacenamiento, user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        db.execute_update(insert_query, (
            dataset_id,
            filename,
            "text/csv",
            "MODELO_ENTRENADO",
            str(file_path),
            user_id
        ))
        
        return {
            "message": "✅ Modelo entrenado correctamente y guardado en BD",
            "model_result": model_result,
            "dataset_id": dataset_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-types")
async def get_model_types():
    """Obtener tipos de modelos disponibles"""
    model_types = [
        {
            "id": "random-forest",
            "name": "Random Forest",
            "description": "Ensemble de árboles de decisión",
            "framework": "scikit-learn",
            "best_for": "Clasificación y regresión general"
        },
        {
            "id": "svm",
            "name": "Support Vector Machine",
            "description": "Máquinas de vectores de soporte",
            "framework": "scikit-learn",
            "best_for": "Clasificación con datos de alta dimensión"
        },
        {
            "id": "gradient-boost",
            "name": "Gradient Boosting",
            "description": "Boosting con gradientes",
            "framework": "scikit-learn",
            "best_for": "Alta precisión en clasificación"
        },
        {
            "id": "neural-network",
            "name": "Neural Network (sklearn)",
            "description": "Red neuronal multicapa básica",
            "framework": "scikit-learn",
            "best_for": "Problemas de clasificación simples"
        },
        {
            "id": "pytorch-neural-network",
            "name": "Deep Neural Network",
            "description": "Red neuronal profunda con PyTorch",
            "framework": "pytorch",
            "best_for": "Problemas complejos de clasificación"
        },
        {
            "id": "pytorch-cnn-lstm",
            "name": "CNN-LSTM",
            "description": "Red convolucional con LSTM",
            "framework": "pytorch",
            "best_for": "Series temporales y secuencias"
        }
    ]
    return model_types

@router.get("/{model_id}")
async def get_model(model_id: str):
    """Obtener detalles de un modelo específico"""
    model = ml_service.trained_models.get(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")
    return model

@router.post("/{model_id}/export")
async def export_model(model_id: str):
    """Exportar un modelo entrenado"""
    try:
        return ml_service.export_model(model_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
