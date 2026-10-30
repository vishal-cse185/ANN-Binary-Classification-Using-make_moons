import pytest
import numpy as np
from backend.app.model_service import model_service
from backend.app.explain_service import explain_service

def test_model_architecture():
    arch = model_service.get_architecture()
    assert arch.input_shape == [2]
    assert arch.output_shape == [1]
    # Check hidden layers: 16, 32, 16
    assert arch.layers[1].neurons == 16
    assert arch.layers[2].neurons == 32
    assert arch.layers[3].neurons == 16
    assert arch.layers[4].neurons == 1
    assert arch.total_params > 500

def test_prediction_output():
    # Test predict_point returns valid ranges
    pred = model_service.predict_point(0.0, 0.5)
    assert 0.0 <= pred.raw_probability <= 1.0
    assert pred.predicted_class in [0, 1]
    assert 0.0 <= pred.confidence <= 100.0

def test_explain_service():
    exp = explain_service.explain_point(0.5, 0.25)
    assert len(exp.layer_traces) == 4
    assert exp.layer_traces[0].num_neurons == 16
    assert exp.layer_traces[1].num_neurons == 32
    assert exp.layer_traces[2].num_neurons == 16
    assert exp.layer_traces[3].num_neurons == 1
    assert "Forward Propagation" in exp.concepts_summary
