from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import data, models, results, dashboard

app = FastAPI(title="ML Pipeline API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(data.router, prefix="/api/data", tags=["data"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
async def root():
    return {"message": "ML Pipeline API funcionando correctamente"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API funcionando"}
