import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_architecture_endpoint():
    resp = client.get("/api/model/architecture")
    assert resp.status_code == 200
    data = resp.json()
    assert "layers" in data
    assert data["total_params"] > 0

def test_predict_endpoint():
    resp = client.post("/api/predict", json={"x1": 0.5, "x2": -0.2})
    assert resp.status_code == 200
    data = resp.json()
    assert "raw_probability" in data
    assert "predicted_class" in data
    assert data["predicted_class"] in [0, 1]

def test_dataset_generation_api():
    resp = client.post("/api/dataset/generate", json={
        "n_samples": 500,
        "noise": 0.15,
        "random_state": 42,
        "test_size": 0.2
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_samples"] == 500
    assert data["n_train"] == 400
    assert data["n_test"] == 100
