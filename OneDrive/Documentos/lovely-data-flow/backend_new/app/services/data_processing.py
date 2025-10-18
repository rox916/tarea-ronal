import pandas as pd
import numpy as np
from typing import Dict, List, Any
import io
import os

class DataProcessor:
    """Servicio de procesamiento de datos usando pandas y numpy"""

    def __init__(self):
        self.data = None
        self.quality_metrics = {}

    def load_csv(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Cargar datos CSV y devolver información básica"""
        try:
            # Validar que el archivo no esté vacío
            if len(file_content) == 0:
                raise ValueError("El archivo está vacío")
            
            # Intentar decodificar el contenido
            try:
                content_str = file_content.decode('utf-8')
            except UnicodeDecodeError:
                # Intentar con diferentes encodings
                try:
                    content_str = file_content.decode('latin-1')
                except UnicodeDecodeError:
                    content_str = file_content.decode('cp1252')
            
            # Cargar el CSV
            self.data = pd.read_csv(io.StringIO(content_str))
            
            # Validar que el DataFrame no esté vacío
            if self.data.empty:
                raise ValueError("El archivo CSV no contiene datos")
            
            info = {
                "filename": filename,
                "rows": len(self.data),
                "columns": len(self.data.columns),
                "column_names": list(self.data.columns),
                "data_types": self.data.dtypes.astype(str).to_dict(),
                "preview": self.data.head().to_dict('records')
            }
            return info
        except pd.errors.EmptyDataError:
            raise ValueError("El archivo CSV está vacío o no tiene datos válidos")
        except pd.errors.ParserError as e:
            raise ValueError(f"Error al parsear el CSV: {str(e)}")
        except Exception as e:
            raise Exception(f"Error cargando CSV: {str(e)}")

    def load_csv_from_path(self, file_path: str) -> Dict[str, Any]:
        """Cargar CSV directamente desde una ruta en disco y devolver información básica"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Archivo no encontrado: {file_path}")

            self.data = pd.read_csv(file_path)

            if self.data.empty:
                raise ValueError("El archivo CSV no contiene datos")

            info = {
                "filename": os.path.basename(file_path),
                "rows": len(self.data),
                "columns": len(self.data.columns),
                "column_names": list(self.data.columns),
                "data_types": self.data.dtypes.astype(str).to_dict(),
                "preview": self.data.head().to_dict('records')
            }
            return info
        except pd.errors.EmptyDataError:
            raise ValueError("El archivo CSV está vacío o no tiene datos válidos")
        except pd.errors.ParserError as e:
            raise ValueError(f"Error al parsear el CSV: {str(e)}")
        except Exception as e:
            raise Exception(f"Error cargando CSV desde ruta: {str(e)}")

    def analyze_data_quality(self) -> Dict[str, Any]:
        """Analizar métricas de calidad de datos"""
        if self.data is None:
            raise Exception("No hay datos cargados")
        
        # Calcular métricas reales
        null_count = self.data.isnull().sum().sum()
        duplicate_count = self.data.duplicated().sum()
        
        completeness = ((len(self.data) - null_count) / (len(self.data) * len(self.data.columns))) * 100
        
        self.quality_metrics = {
            "completeness": round(completeness, 2),
            "consistency": 88.0,  # Simulado
            "accuracy": 92.0,      # Simulado
            "null_values": int(null_count),
            "duplicates": int(duplicate_count),
            "outliers": 5          # Simulado
        }
        return self.quality_metrics

    def clean_data(self) -> Dict[str, Any]:
        """Limpiar los datos y devolver reporte de limpieza"""
        if self.data is None:
            raise Exception("No hay datos cargados")
        
        original_rows = len(self.data)
        
        # Limpiar datos reales
        self.data = self.data.dropna()  # Eliminar filas con valores nulos
        self.data = self.data.drop_duplicates()  # Eliminar duplicados
        
        cleaned_rows = len(self.data)
        rows_removed = original_rows - cleaned_rows
        
        cleaning_report = {
            "null_values_filled": 0,
            "duplicates_removed": int(rows_removed),
            "outliers_removed": 0,
            "normalized_columns": list(self.data.columns),
            "final_rows": cleaned_rows,
            "rows_removed": int(rows_removed)
        }
        return cleaning_report

    def get_cleaned_data(self) -> pd.DataFrame:
        """Obtener datos limpios"""
        return self.data

    def get_data_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de los datos"""
        if self.data is None:
            raise Exception("No hay datos cargados")
        
        return {
            "shape": self.data.shape,
            "columns": list(self.data.columns),
            "dtypes": self.data.dtypes.astype(str).to_dict(),
            "describe": self.data.describe().to_dict()
        }
