"""
Servicio para modelos de PyTorch (Deep Learning)
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import pickle
import os
from typing import Dict, Any, Tuple, List


class PyTorchMLP(nn.Module):
    """Red neuronal multicapa con PyTorch"""
    
    def __init__(self, input_size: int, hidden_sizes: List[int], output_size: int, dropout_rate: float = 0.2):
        super(PyTorchMLP, self).__init__()
        
        layers = []
        prev_size = input_size
        
        for hidden_size in hidden_sizes:
            layers.append(nn.Linear(prev_size, hidden_size))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout_rate))
            prev_size = hidden_size
        
        layers.append(nn.Linear(prev_size, output_size))
        layers.append(nn.Softmax(dim=1))
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)


class PyTorchCNNLSTM(nn.Module):
    """Modelo CNN-LSTM para series temporales"""
    
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, output_size: int):
        super(PyTorchCNNLSTM, self).__init__()
        
        self.conv1d = nn.Conv1d(input_size, 64, kernel_size=3, padding=1)
        self.lstm = nn.LSTM(64, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        self.softmax = nn.Softmax(dim=1)
    
    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_size)
        x = x.transpose(1, 2)  # (batch_size, input_size, sequence_length)
        x = torch.relu(self.conv1d(x))
        x = x.transpose(1, 2)  # (batch_size, sequence_length, 64)
        
        lstm_out, _ = self.lstm(x)
        x = self.fc(lstm_out[:, -1, :])  # Tomar la última salida
        return self.softmax(x)


class PyTorchService:
    """Servicio para entrenar modelos con PyTorch"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"🔧 Usando dispositivo: {self.device}")
    
    def prepare_data(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Tuple[DataLoader, DataLoader, StandardScaler, LabelEncoder]:
        """Preparar datos para PyTorch"""
        
        # Codificar target
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        
        # Normalizar features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=test_size, random_state=42, stratify=y_encoded
        )
        
        # Convertir a tensores
        X_train_tensor = torch.FloatTensor(X_train)
        y_train_tensor = torch.LongTensor(y_train)
        X_test_tensor = torch.FloatTensor(X_test)
        y_test_tensor = torch.LongTensor(y_test)
        
        # Crear DataLoaders
        train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
        test_dataset = TensorDataset(X_test_tensor, y_test_tensor)
        
        train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
        
        return train_loader, test_loader, scaler, le
    
    def train_neural_network(self, train_loader: DataLoader, test_loader: DataLoader, 
                           input_size: int, output_size: int, epochs: int = 100, 
                           learning_rate: float = 0.001, hidden_sizes: List[int] = [128, 64]) -> Tuple[nn.Module, Dict]:
        """Entrenar red neuronal con PyTorch"""
        
        # Crear modelo
        model = PyTorchMLP(input_size, hidden_sizes, output_size).to(self.device)
        
        # Optimizador y función de pérdida
        optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        criterion = nn.CrossEntropyLoss()
        
        # Historial de entrenamiento
        history = {
            'train_loss': [],
            'train_accuracy': [],
            'val_loss': [],
            'val_accuracy': []
        }
        
        # Entrenamiento
        for epoch in range(epochs):
            # Entrenamiento
            model.train()
            train_loss = 0.0
            train_correct = 0
            train_total = 0
            
            for batch_X, batch_y in train_loader:
                batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device)
                
                optimizer.zero_grad()
                outputs = model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                
                train_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                train_total += batch_y.size(0)
                train_correct += (predicted == batch_y).sum().item()
            
            # Validación
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0
            
            with torch.no_grad():
                for batch_X, batch_y in test_loader:
                    batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device)
                    outputs = model(batch_X)
                    loss = criterion(outputs, batch_y)
                    
                    val_loss += loss.item()
                    _, predicted = torch.max(outputs.data, 1)
                    val_total += batch_y.size(0)
                    val_correct += (predicted == batch_y).sum().item()
            
            # Guardar métricas
            train_loss_avg = train_loss / len(train_loader)
            train_acc = train_correct / train_total
            val_loss_avg = val_loss / len(test_loader)
            val_acc = val_correct / val_total
            
            history['train_loss'].append(train_loss_avg)
            history['train_accuracy'].append(train_acc)
            history['val_loss'].append(val_loss_avg)
            history['val_accuracy'].append(val_acc)
            
            if epoch % 10 == 0:
                print(f"Epoch {epoch}: Train Loss: {train_loss_avg:.4f}, Train Acc: {train_acc:.4f}, Val Loss: {val_loss_avg:.4f}, Val Acc: {val_acc:.4f}")
        
        return model, history
    
    def train_cnn_lstm(self, train_loader: DataLoader, test_loader: DataLoader,
                      input_size: int, output_size: int, epochs: int = 100,
                      learning_rate: float = 0.001, hidden_size: int = 64, 
                      num_layers: int = 2) -> Tuple[nn.Module, Dict]:
        """Entrenar modelo CNN-LSTM con PyTorch"""
        
        # Crear modelo
        model = PyTorchCNNLSTM(input_size, hidden_size, num_layers, output_size).to(self.device)
        
        # Optimizador y función de pérdida
        optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        criterion = nn.CrossEntropyLoss()
        
        # Historial de entrenamiento
        history = {
            'train_loss': [],
            'train_accuracy': [],
            'val_loss': [],
            'val_accuracy': []
        }
        
        # Entrenamiento
        for epoch in range(epochs):
            # Entrenamiento
            model.train()
            train_loss = 0.0
            train_correct = 0
            train_total = 0
            
            for batch_X, batch_y in train_loader:
                batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device)
                
                optimizer.zero_grad()
                outputs = model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                
                train_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                train_total += batch_y.size(0)
                train_correct += (predicted == batch_y).sum().item()
            
            # Validación
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0
            
            with torch.no_grad():
                for batch_X, batch_y in test_loader:
                    batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device)
                    outputs = model(batch_X)
                    loss = criterion(outputs, batch_y)
                    
                    val_loss += loss.item()
                    _, predicted = torch.max(outputs.data, 1)
                    val_total += batch_y.size(0)
                    val_correct += (predicted == batch_y).sum().item()
            
            # Guardar métricas
            train_loss_avg = train_loss / len(train_loader)
            train_acc = train_correct / train_total
            val_loss_avg = val_loss / len(test_loader)
            val_acc = val_correct / val_total
            
            history['train_loss'].append(train_loss_avg)
            history['train_accuracy'].append(train_acc)
            history['val_loss'].append(val_loss_avg)
            history['val_accuracy'].append(val_acc)
            
            if epoch % 10 == 0:
                print(f"Epoch {epoch}: Train Loss: {train_loss_avg:.4f}, Train Acc: {train_acc:.4f}, Val Loss: {val_loss_avg:.4f}, Val Acc: {val_acc:.4f}")
        
        return model, history
    
    def evaluate_model(self, model: nn.Module, test_loader: DataLoader) -> Dict[str, float]:
        """Evaluar modelo entrenado"""
        model.eval()
        all_predictions = []
        all_targets = []
        
        with torch.no_grad():
            for batch_X, batch_y in test_loader:
                batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device)
                outputs = model(batch_X)
                _, predicted = torch.max(outputs.data, 1)
                
                all_predictions.extend(predicted.cpu().numpy())
                all_targets.extend(batch_y.cpu().numpy())
        
        # Calcular métricas
        accuracy = accuracy_score(all_targets, all_predictions)
        precision = precision_score(all_targets, all_predictions, average='weighted')
        recall = recall_score(all_targets, all_predictions, average='weighted')
        f1 = f1_score(all_targets, all_predictions, average='weighted')
        
        return {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'confusion_matrix': confusion_matrix(all_targets, all_predictions).tolist()
        }
    
    def save_model(self, model: nn.Module, scaler: StandardScaler, le: LabelEncoder, 
                   model_path: str, scaler_path: str, le_path: str):
        """Guardar modelo y preprocessors"""
        # Guardar modelo
        torch.save(model.state_dict(), model_path)
        
        # Guardar scaler
        with open(scaler_path, 'wb') as f:
            pickle.dump(scaler, f)
        
        # Guardar label encoder
        with open(le_path, 'wb') as f:
            pickle.dump(le, f)
    
    def load_model(self, model: nn.Module, model_path: str, scaler_path: str, le_path: str) -> Tuple[StandardScaler, LabelEncoder]:
        """Cargar modelo y preprocessors"""
        # Cargar modelo
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.eval()
        
        # Cargar scaler
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        # Cargar label encoder
        with open(le_path, 'rb') as f:
            le = pickle.load(f)
        
        return scaler, le



