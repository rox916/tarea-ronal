from fastapi import APIRouter
from typing import Dict, Any
import random

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    """Obtener estadísticas del dashboard"""
    return {
        "datasets_loaded": random.randint(1, 10),
        "models_trained": random.randint(1, 15),
        "completed_models": random.randint(1, 10),
        "average_accuracy": round(random.uniform(85.0, 99.0), 2),
        "recent_activity": [
            {"event": "Dataset cargado", "timestamp": "2023-10-26T10:00:00Z"},
            {"event": "Modelo entrenado", "timestamp": "2023-10-26T11:30:00Z"},
        ]
    }

@router.get("/data-quality-summary")
async def get_data_quality_summary():
    """Obtener resumen de calidad de datos"""
    return {
        "completeness": random.uniform(80.0, 100.0),
        "consistency": random.uniform(75.0, 100.0),
        "accuracy": random.uniform(80.0, 100.0),
        "null_values_detected": random.randint(0, 20),
        "duplicates_detected": random.randint(0, 10),
        "outliers_detected": random.randint(0, 5),
    }

@router.get("/recent-activity")
async def get_recent_activity():
    """Obtener actividad reciente"""
    activities = [
        {
            "type": "dataset_upload",
            "id": 1,
            "name": "iris_dataset.csv",
            "timestamp": "2023-10-26T10:00:00Z",
            "description": "Dataset cargado exitosamente"
        },
        {
            "type": "model_training",
            "id": 1,
            "name": "Neural Network Model",
            "timestamp": "2023-10-26T11:30:00Z",
            "description": "Modelo entrenado con 95% de precisión"
        },
        {
            "type": "data_cleaning",
            "id": 1,
            "name": "Data Cleaning Process",
            "timestamp": "2023-10-26T09:15:00Z",
            "description": "Limpieza de datos completada"
        }
    ]
    return activities

@router.get("/model-performance")
async def get_model_performance():
    """Obtener rendimiento de modelos"""
    return {
        "best_model": {
            "name": "Neural Network v2.1",
            "accuracy": 96.5,
            "precision": 94.2,
            "recall": 95.8,
            "f1_score": 95.0
        },
        "model_comparison": [
            {"name": "Random Forest", "accuracy": 89.2},
            {"name": "SVM", "accuracy": 91.5},
            {"name": "Neural Network", "accuracy": 96.5},
            {"name": "Gradient Boosting", "accuracy": 93.1}
        ],
        "training_trends": {
            "average_accuracy": 92.3,
            "improvement_rate": 2.1,
            "total_models": 15
        }
    }