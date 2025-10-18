const API_BASE_URL = 'http://localhost:8002/api';

export interface Dataset {
  id: string;
  nombre_archivo: string;
  tipo_archivo: string;
  estado_procesamiento: string;
  created_at: string;
  user_id: string;
}

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  modified: number;
}

export interface DataQuality {
  completeness: number;
  consistency: number;
  accuracy: number;
  null_values: number;
  duplicates: number;
  outliers: number;
}

export interface Model {
  id: string;
  dataset_id: string;
  datos_exportados: any;
  metricas_entrenamiento: any;
  fecha_entrenamiento: string;
  status: string;
}

export interface TrainingResult {
  epoch: number;
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface DashboardStats {
  datasets_loaded: number;
  models_trained: number;
  completed_models: number;
  average_accuracy: number;
}

export interface Activity {
  type: string;
  id: number;
  name: string;
  timestamp: string;
  description: string;
}

// Data API
export const dataApi = {
  async uploadFile(file: File): Promise<{ dataset_id: number; data_info: any }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      // Try to extract useful error details from the response body (JSON or text)
      const text = await response.text();
      let serverDetail = text;
      try {
        const json = JSON.parse(text);
        serverDetail = JSON.stringify(json);
      } catch (_) {
        // not JSON, keep raw text
      }
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${serverDetail}`);
    }

    return response.json();
  },

  async getDatasets(): Promise<Dataset[]> {
    const response = await fetch(`${API_BASE_URL}/data/datasets`);
    if (!response.ok) {
      throw new Error('Failed to fetch datasets');
    }
    return response.json();
  },

  async getUploadedFiles(): Promise<UploadedFile[]> {
    const response = await fetch(`${API_BASE_URL}/data/uploaded-files`);
    if (!response.ok) {
      throw new Error('Failed to fetch uploaded files');
    }
    return response.json();
  },

  async getDataset(id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE_URL}/data/datasets/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch dataset');
    }
    return response.json();
  },

  async analyzeDataQuality(datasetId: string): Promise<DataQuality> {
    const response = await fetch(`${API_BASE_URL}/data/analyze/${datasetId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to analyze data quality');
    }
    return response.json();
  },

  async cleanData(datasetId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/data/clean/${datasetId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to clean data');
    }
    return response.json();
  },

  async cleanFile(filename: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/data/clean-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });
    if (!response.ok) {
      throw new Error('Failed to clean file');
    }
    return response.json();
  },

  async getDataPreview(datasetId: string, limit: number = 10): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/data/preview/${datasetId}?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data preview');
    }
    return response.json();
  },

  async getFilePreview(filename: string, limit: number = 10): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/data/preview-file/${filename}?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch file preview');
    }
    return response.json();
  },
};

// Models API
export const modelsApi = {
  async trainModel(data: {
    dataset_id: string;
    model_type: string;
    target_column: string;
    epochs?: number;
    learning_rate?: number;
    test_size?: number;
    parameters?: Record<string, any>;
  }): Promise<{ model_id: string; result: any }> {
    // Construir query parameters
    const params = new URLSearchParams({
      dataset_id: data.dataset_id,
      model_type: data.model_type,
      target_column: data.target_column,
      epochs: (data.epochs || 10).toString(),
      learning_rate: (data.learning_rate || 0.001).toString(),
      test_size: (data.test_size || 0.2).toString(),
    });
    
    // Agregar parámetros si existen
    if (data.parameters) {
      Object.entries(data.parameters).forEach(([key, value]) => {
        params.append('parameters', `${key}:${value}`);
      });
    }

    const response = await fetch(`${API_BASE_URL}/models/train?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to train model');
    }
    
    return response.json();
  },

  async trainModelWithFile(data: {
    filename: string;
    model_type: string;
    target_column: string;
    test_size?: number;
    parameters?: Record<string, any>;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/models/train-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to train model with file');
    }
    
    return response.json();
  },

  async getModels(): Promise<Model[]> {
    const response = await fetch(`${API_BASE_URL}/models/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    return response.json();
  },

  async getModel(id: string): Promise<Model> {
    const response = await fetch(`${API_BASE_URL}/models/models/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch model');
    }
    return response.json();
  },

  async getTrainingHistory(modelId: string): Promise<TrainingResult[]> {
    const response = await fetch(`${API_BASE_URL}/models/models/${modelId}/training-history`);
    if (!response.ok) {
      throw new Error('Failed to fetch training history');
    }
    return response.json();
  },

  async predict(modelId: string, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/models/models/${modelId}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to make prediction');
    }
    
    return response.json();
  },

  async exportModel(modelId: string): Promise<{ file_path: string; download_url: string }> {
    const response = await fetch(`${API_BASE_URL}/models/models/${modelId}/export`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to export model');
    }
    
    return response.json();
  },
};

// Results API
export const resultsApi = {
  async getModelMetrics(modelId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/results/metrics/${modelId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch model metrics');
    }
    return response.json();
  },

  async getTrainingHistory(modelId: string): Promise<TrainingResult[]> {
    const response = await fetch(`${API_BASE_URL}/results/training-history/${modelId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch training history');
    }
    return response.json();
  },

  async getConfusionMatrix(modelId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/results/confusion-matrix/${modelId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch confusion matrix');
    }
    return response.json();
  },

  async getPerformanceComparison(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/results/performance-comparison`);
    if (!response.ok) {
      throw new Error('Failed to fetch performance comparison');
    }
    return response.json();
  },

  async exportModelResults(modelId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/results/export/${modelId}`);
    if (!response.ok) {
      throw new Error('Failed to export model results');
    }
    return response.json();
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  },

  async getRecentActivity(): Promise<Activity[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-activity`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }
    return response.json();
  },

  async getDataQualitySummary(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/data-quality-summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch data quality summary');
    }
    return response.json();
  },

  async getModelPerformance(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/model-performance`);
    if (!response.ok) {
      throw new Error('Failed to fetch model performance');
    }
    return response.json();
  },
};
