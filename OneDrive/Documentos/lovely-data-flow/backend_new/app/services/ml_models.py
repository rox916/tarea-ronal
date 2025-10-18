import pandas as pd
import numpy as np
from typing import Dict, Any, List
from pathlib import Path


class MLModelsService:
    """Servicio para entrenamiento y evaluación de modelos de ML usando scikit-learn.

    Este servicio espera que el dataset ya esté guardado en disco y disponible en `datasets.ruta_almacenamiento`.
    """

    def __init__(self):
        self.trained_models: Dict[str, Dict[str, Any]] = {}
        self.model_metrics: Dict[str, Dict[str, float]] = {}
        self.training_history: Dict[str, List[Dict[str, Any]]] = {}
        self.confusion_matrices: Dict[str, Dict[str, Any]] = {}

    def _prepare_features(self, df: pd.DataFrame, target_column: str):
        if target_column not in df.columns:
            raise ValueError(f"La columna objetivo '{target_column}' no existe en el dataset")

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # One-hot encode categorical features
        X = pd.get_dummies(X, drop_first=True)
        X = X.fillna(0)
        
        # Ensure all features are numeric
        X = X.astype(float)

        # For target, if categorical, leave as-is; caller handles label encoding if needed
        return X, y

    def train_model(self, dataset_path: str, model_type: str, target_column: str, test_size: float = 0.2, parameters: Dict = None) -> Dict[str, Any]:
        """Entrena un modelo real usando scikit-learn y devuelve metadatos.

        - dataset_path: ruta al CSV en disco
        - model_type: 'random-forest' | 'svm' | 'gradient-boost'
        - target_column: nombre de la columna objetivo
        - parameters: dict con parámetros como n_estimators
        """
        import uuid
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.svm import SVC
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
        import joblib
        import json

        model_id = str(uuid.uuid4())

        # Load dataset
        df = pd.read_csv(dataset_path)

        X, y = self._prepare_features(df, target_column)

        # If y is categorical, encode with pandas factorize
        if y.dtype == 'object' or str(y.dtype).startswith('category'):
            y_encoded, uniques = pd.factorize(y)
            class_labels = list(uniques.astype(str))
        else:
            y_encoded = y.values
            class_labels = []

        X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=test_size, random_state=42)

        # Choose model
        params = parameters or {}
        if model_type == 'random-forest':
            clf = RandomForestClassifier(n_estimators=params.get('n_estimators', 100), random_state=42)
        elif model_type == 'svm':
            clf = SVC(probability=True, random_state=42)
        elif model_type == 'gradient-boost':
            clf = GradientBoostingClassifier(random_state=42)
        else:
            raise ValueError(f"model_type desconocido: {model_type}")

        clf.fit(X_train, y_train)

        preds = clf.predict(X_test)

        accuracy = float(accuracy_score(y_test, preds))
        precision = float(precision_score(y_test, preds, average='weighted', zero_division=0))
        recall = float(recall_score(y_test, preds, average='weighted', zero_division=0))
        f1 = float(f1_score(y_test, preds, average='weighted', zero_division=0))

        cm = confusion_matrix(y_test, preds).tolist()

        metricas_entrenamiento = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'model_type': model_type,
            'target_column': target_column,
            'test_size': test_size,
            'parameters': params
        }

        # Save model
        models_dir = Path.cwd() / 'models'
        models_dir.mkdir(parents=True, exist_ok=True)
        model_path = models_dir / f"model_{model_id}.joblib"
        joblib.dump(clf, model_path)

        datos_exportados = {
            'model_path': str(model_path),
            'model_type': model_type,
            'target_column': target_column,
            'features': X.columns.tolist(),
            'class_labels': class_labels
        }

        # Persist in-memory
        self.trained_models[model_id] = {
            'id': model_id,
            'dataset_path': dataset_path,
            'datos_exportados': datos_exportados,
            'metricas_entrenamiento': metricas_entrenamiento,
            'fecha_entrenamiento': pd.Timestamp.now().isoformat(),
            'status': 'completed',
            'confusion_matrix': cm
        }

        self.model_metrics[model_id] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1
        }

        self.confusion_matrices[model_id] = {'class_labels': class_labels, 'confusion_matrix': cm}

        self.training_history[model_id] = [{'epoch': 1, 'loss': None, 'accuracy': accuracy}]

        return self.trained_models[model_id]

    def get_models(self) -> List[Dict[str, Any]]:
        return list(self.trained_models.values())

    def get_model_metrics(self, model_id: str) -> Dict[str, Any]:
        return self.model_metrics.get(model_id, {})

    def get_training_history(self, model_id: str) -> List[Dict[str, Any]]:
        return self.training_history.get(model_id, [])

    def get_confusion_matrix(self, model_id: str) -> Dict[str, Any]:
        return self.confusion_matrices.get(model_id, {})

    def export_model(self, model_id: str) -> Dict[str, Any]:
        if model_id not in self.trained_models:
            raise Exception("Modelo no encontrado")
        return {"message": f"Modelo {model_id} exportado exitosamente", "path": self.trained_models[model_id]['datos_exportados']}

    def get_models(self) -> List[Dict[str, Any]]:
        """Obtener todos los modelos entrenados"""
        return list(self.trained_models.values())

    def get_model_metrics(self, model_id: str) -> Dict[str, Any]:
        """Obtener métricas de un modelo específico"""
        return self.model_metrics.get(model_id, {})

    def get_training_history(self, model_id: str) -> List[Dict[str, Any]]:
        """Obtener historial de entrenamiento de un modelo"""
        return self.training_history.get(model_id, [])

    def get_confusion_matrix(self, model_id: str) -> Dict[str, Any]:
        """Obtener matriz de confusión de un modelo"""
        return self.confusion_matrices.get(model_id, {})

    def export_model(self, model_id: str) -> Dict[str, Any]:
        """Exportar un modelo entrenado"""
        if model_id not in self.trained_models:
            raise Exception("Modelo no encontrado")
        return {"message": f"Modelo {model_id} exportado exitosamente"}
