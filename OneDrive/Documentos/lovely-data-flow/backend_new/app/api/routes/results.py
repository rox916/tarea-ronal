from fastapi import APIRouter, HTTPException
from app.services.ml_models import MLModelsService
from typing import List, Dict, Any

router = APIRouter()
ml_service = MLModelsService()

@router.get("/metrics/{model_id}")
async def get_model_metrics(model_id: str):
    """Obtener métricas de evaluación de un modelo"""
    metrics = ml_service.get_model_metrics(model_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Métricas no encontradas para el modelo")
    return metrics

@router.get("/training-history/{model_id}")
async def get_training_history(model_id: str):
    """Obtener historial de entrenamiento de un modelo"""
    history = ml_service.get_training_history(model_id)
    if not history:
        raise HTTPException(status_code=404, detail="Historial de entrenamiento no encontrado para el modelo")
    return history

@router.get("/confusion-matrix/{model_id}")
async def get_confusion_matrix(model_id: str):
    """Obtener matriz de confusión de un modelo"""
    matrix = ml_service.get_confusion_matrix(model_id)
    if not matrix:
        raise HTTPException(status_code=404, detail="Matriz de confusión no encontrada para el modelo")
    return matrix

@router.get("/performance-comparison")
async def get_performance_comparison():
    """Obtener comparación de rendimiento entre modelos"""
    return [
        {
            "model_name": "Random Forest",
            "accuracy": 0.892,
            "precision": 0.876,
            "recall": 0.901,
            "f1_score": 0.888,
            "training_time": 45.2
        },
        {
            "model_name": "SVM",
            "accuracy": 0.915,
            "precision": 0.901,
            "recall": 0.928,
            "f1_score": 0.914,
            "training_time": 67.8
        },
        {
            "model_name": "Neural Network",
            "accuracy": 0.965,
            "precision": 0.942,
            "recall": 0.958,
            "f1_score": 0.950,
            "training_time": 120.5
        },
        {
            "model_name": "Gradient Boosting",
            "accuracy": 0.931,
            "precision": 0.918,
            "recall": 0.945,
            "f1_score": 0.931,
            "training_time": 89.3
        }
    ]

@router.get("/export/{model_id}")
async def export_model_results(model_id: str):
    """Exportar resultados de un modelo"""
    try:
        # Simular exportación
        return {
            "message": f"Resultados del modelo {model_id} exportados exitosamente",
            "file_path": f"/exports/model_{model_id}_results.json",
            "download_url": f"/api/results/download/{model_id}",
            "exported_at": "2023-10-26T12:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al exportar resultados: {e}")