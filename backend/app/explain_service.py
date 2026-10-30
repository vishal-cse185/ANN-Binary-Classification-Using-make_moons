import numpy as np
from typing import Dict, Any, List
from .model_service import model_service
from .schemas import ExplainResponse, LayerActivationTrace

class ExplainService:
    def explain_point(self, x1: float, x2: float) -> ExplainResponse:
        model = model_service.model
        if model is None:
            model_service.evaluate()
            model = model_service.model

        current_activation = np.array([[x1, x2]], dtype=np.float32)
        layer_traces: List[LayerActivationTrace] = []

        layer_idx = 0
        for layer in model.layers:
            layer_idx += 1
            weights, biases = layer.get_weights()
            # z = a_prev @ W + b
            z = np.dot(current_activation, weights) + biases
            
            act_name = layer.activation.__name__ if hasattr(layer, "activation") and layer.activation else "linear"
            if act_name == "relu":
                a = np.maximum(0, z)
            elif act_name == "sigmoid":
                a = 1.0 / (1.0 + np.exp(-np.clip(z, -25.0, 25.0)))
            else:
                a = z

            pre_list = [round(float(val), 4) for val in z[0]]
            post_list = [round(float(val), 4) for val in a[0]]

            layer_traces.append(LayerActivationTrace(
                layer_index=layer_idx,
                layer_name=layer.name,
                num_neurons=len(post_list),
                activation_type=act_name.upper(),
                pre_activations=pre_list,
                post_activations=post_list
            ))
            current_activation = a

        final_prob = float(current_activation[0][0])
        pred_class = 1 if final_prob >= 0.5 else 0

        # Mathematical breakdown
        eps = 1e-15
        p_clipped = np.clip(final_prob, eps, 1.0 - eps)
        loss_if_c0 = -np.log(1.0 - p_clipped)
        loss_if_c1 = -np.log(p_clipped)

        math_breakdown = {
            "input_vector": [x1, x2],
            "layer_1_active_neurons": sum(1 for v in layer_traces[0].post_activations if v > 0),
            "layer_1_total_neurons": 16,
            "layer_2_active_neurons": sum(1 for v in layer_traces[1].post_activations if v > 0),
            "layer_2_total_neurons": 32,
            "layer_3_active_neurons": sum(1 for v in layer_traces[2].post_activations if v > 0),
            "layer_3_total_neurons": 16,
            "output_logit_z": layer_traces[3].pre_activations[0],
            "output_sigmoid_prob": round(final_prob, 4),
            "binary_cross_entropy": {
                "formula": "L(y, p) = - [y * log(p) + (1 - y) * log(1 - p)]",
                "loss_if_true_label_0": round(float(loss_if_c0), 4),
                "loss_if_true_label_1": round(float(loss_if_c1), 4),
            }
        }

        # Decision rationale
        if pred_class == 1:
            rationale = (
                f"For input point ({x1:.2f}, {x2:.2f}), the network computed a final logit of {layer_traces[3].pre_activations[0]:.3f}, "
                f"which the Sigmoid activation mapped to a probability of {final_prob * 100:.2f}%. "
                f"Since p >= 0.50, the model confidently assigns this coordinate to Class 1 (Outer Crescent Moon). "
                f"{math_breakdown['layer_1_active_neurons']}/16 neurons fired in Hidden Layer 1, providing non-linear bending of the space."
            )
        else:
            rationale = (
                f"For input point ({x1:.2f}, {x2:.2f}), the network computed a final logit of {layer_traces[3].pre_activations[0]:.3f}, "
                f"which the Sigmoid activation mapped to a probability of {final_prob * 100:.2f}%. "
                f"Since p < 0.50, the model assigns this coordinate to Class 0 (Inner Crescent Moon) with {((1 - final_prob) * 100):.2f}% confidence."
            )

        concepts = {
            "Forward Propagation": "Inputs (X1, X2) are sequentially multiplied by weight matrices W, added to bias vectors b, and transformed through non-linear activation functions layer by layer until producing the output probability.",
            "Activation Functions": "Hidden layers utilize ReLU (f(z) = max(0, z)), which introduces non-linearity without gradient saturation on positive values, enabling the network to fold Euclidean space to separate intertwining moons. The output layer uses Sigmoid (sigma(z) = 1 / (1 + e^-z)) to bound the output to [0, 1].",
            "Loss Calculation": "Binary Cross-Entropy penalizes divergences between predictions and ground truth: L = -[y*log(p) + (1-y)*log(1-p)]. A prediction close to the wrong class incurs logarithmic penalties.",
            "Backpropagation": "The gradient of the loss with respect to every weight (dL/dW) is computed via the chain rule backwards from output to input: dL/dz * dz/dW.",
            "Weight Updates": "Adam optimizer adjusts each parameter using running estimates of the first moment (mean gradients) and second moment (uncentered variance), adaptively scaling learning rates per neuron for stable convergence."
        }

        return ExplainResponse(
            input_features=[x1, x2],
            predicted_class=pred_class,
            probability=round(final_prob, 4),
            layer_traces=layer_traces,
            decision_rational=rationale,
            mathematical_breakdown=math_breakdown,
            concepts_summary=concepts
        )

explain_service = ExplainService()
