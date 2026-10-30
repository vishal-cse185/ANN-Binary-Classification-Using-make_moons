import pytest
import numpy as np
from backend.app.data_service import data_service

def test_dataset_generation_default():
    resp = data_service.generate_dataset(n_samples=2000, noise=0.20, random_state=42)
    assert resp.total_samples == 2000
    assert resp.n_train == 1500 # 75%
    assert resp.n_test == 500   # 25%
    assert resp.class_0_count == 1000
    assert resp.class_1_count == 1000
    assert "x1" in resp.feature_stats
    assert "x2" in resp.feature_stats
    assert len(resp.preview) > 0

def test_dataset_reproducibility():
    resp1 = data_service.generate_dataset(n_samples=500, noise=0.15, random_state=99)
    resp2 = data_service.generate_dataset(n_samples=500, noise=0.15, random_state=99)
    assert resp1.preview[0].x1 == resp2.preview[0].x1
    assert resp1.preview[0].x2 == resp2.preview[0].x2

def test_dataset_csv_buffer():
    buf = data_service.get_csv_buffer()
    content = buf.getvalue()
    assert "x1,x2,label,split,id" in content or "label" in content
    assert len(content) > 100
