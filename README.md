# Neural Network Intelligence Studio
### *Interactive Binary Classification & ANN Analysis Platform*

A production-quality educational AI and deep learning web platform for exploring non-linear binary classification on Scikit-learn's `make_moons` dataset using TensorFlow/Keras and FastAPI.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       Client Browser (React + Vite)   |
                      |  TypeScript, Tailwind CSS, Recharts,  |
                      |    Plotly.js, Framer Motion, Lucide   |
                      +---------------------------------------+
                                          |
                                    REST API /api
                                          v
                      +---------------------------------------+
                      |         FastAPI Backend Server        |
                      |     Pydantic Schemas & Data Pipeline  |
                      +---------------------------------------+
                           /              |               \
                          v               v                v
                 +----------------+ +---------------+ +---------------+
                 |  Data Service  | | Model Service | |Explain Service|
                 |  (make_moons)  | |(TensorFlow/   | |(Forward Prop  |
                 |   Scikit-learn | | Keras ANN)    | | & Math Trace) |
                 +----------------+ +---------------+ +---------------+
                          |               |                |
                          v               v                v
                     datasets/         models/        experiments/
                  (CSV / Splits)    (.keras / ckpts)  (Trial Registry)
```

---

## ANN Topology & Specifications

- **Input Layer:** 2 neurons (Feature coordinates $X_1, X_2$)
- **Hidden Layer 1:** 16 neurons with **ReLU** activation ($f(z) = \max(0, z)$) — 48 parameters
- **Hidden Layer 2:** 32 neurons with **ReLU** activation — 544 parameters
- **Hidden Layer 3:** 16 neurons with **ReLU** activation — 528 parameters
- **Output Layer:** 1 neuron with **Sigmoid** activation ($\sigma(z) = \frac{1}{1 + e^{-z}}$) — 17 parameters
- **Total Parameters:** **1,137** (100% trainable)
- **Loss Function:** Binary Cross-Entropy
- **Optimizer:** Adam (Adaptive Moment Estimation)

---

## 7 Core Studio Modules

1. **Overview Dashboard:** Executive KPI cards (Accuracy, Precision, Recall, F1-Score, Total Samples), Model Health gauge, and recent experiment history.
2. **Data Explorer:** Synthesize `make_moons` dataset with 2,000+ samples, adjustable Gaussian noise slider ($0.05 - 0.50$), interactive Plotly scatter manifold, class balance meters, feature distribution stats, and direct CSV export.
3. **ANN Architecture Studio:** Interactive 5-layer computational graph with animated signal propagation pulses, layer selection, parameter formulas, and activation mechanics.
4. **Model Training Center:** Real-time training control panel with adjustable epochs ($10 - 150$), learning rate ($0.001 - 0.05$), mini-batch size, early stopping patience, live progress indicator, and dual Recharts loss/accuracy curves.
5. **Model Evaluation Center:** Comprehensive evaluation report featuring Confusion Matrix ($2 \times 2$ heatmap), Scikit-learn Classification Report, ROC Curve with AUC calculation, 2D continuous Decision Boundary contour map, and JSON report download.
6. **Prediction Playground:** Sub-millisecond coordinate inference playground with manual inputs $(X_1, X_2)$, preset frontier points, probability certainty meters, decision boundary margin calculation, and crosshair interaction.
7. **Model Explainability:** Educational math tracer decomposing forward propagation step-by-step ($z = Wx + b$, $a = \text{ReLU}(z)$), neuron firing heatmaps, logarithmic loss penalties, backpropagation chain rule explanations, and Adam moment equations ($m_t, v_t$).

---

## Quickstart & Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
From the project root:
```bash
# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI backend server (port 8000)
PYTHONPATH=. uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server (port 5173)
npm run dev -- --host 127.0.0.1 --port 5173
```
Now open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your web browser.

---

## Running Unit & Integration Tests

Execute the comprehensive Pytest suite:
```bash
source venv/bin/activate
PYTHONPATH=. pytest tests/ -v
```

Tests validate:
- Dataset generation, stratification balance, and CSV buffers
- ANN model architecture specifications (2 -> 16 -> 32 -> 16 -> 1)
- Training convergence and checkpoint persistence
- Evaluation metrics (Accuracy, ROC AUC, Confusion Matrix)
- Interactive point inference and mathematical forward propagation traces
- REST API contracts via FastAPI `TestClient`

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and system verification |
| `GET` | `/api/model/overview` | Summary KPI metrics, health status, and recent experiment |
| `POST` | `/api/dataset/generate` | Synthesize new `make_moons` dataset with custom noise |
| `GET` | `/api/dataset/current` | Retrieve current dataset preview, scatter points, and statistics |
| `GET` | `/api/dataset/download` | Export current dataset as formatted CSV |
| `GET` | `/api/model/architecture` | 5-layer topological specifications, parameter counts, and shapes |
| `POST` | `/api/train` | Execute backpropagation training cycle with early stopping |
| `GET` | `/api/train/status` | Live polling for epoch progress and training state |
| `GET` | `/api/model/experiments` | List persistent experiment history registry |
| `GET` | `/api/evaluate` | Compute confusion matrix, ROC curve, and decision boundary grid |
| `GET` | `/api/evaluate/report/download` | Export evaluation report as JSON |
| `POST` | `/api/predict` | Compute raw probability, predicted class, and boundary margin for $(X_1, X_2)$ |
| `POST` | `/api/explain` | Step-by-step forward propagation trace, neuron firing states, and mathematical breakdown |

---

## Project Structure

```
neural-network-studio/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entrypoint & lifespan
│   │   ├── config.py            # Paths, default parameters, directory setup
│   │   ├── schemas.py           # Pydantic request/response validation
│   │   ├── data_service.py      # make_moons generation, splitting & CSV export
│   │   ├── model_service.py     # Keras ANN builder, trainer, evaluator & predictor
│   │   ├── explain_service.py   # Forward propagation math trace & neuron activations
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── dataset.py       # Dataset endpoints
│   │       ├── model_routes.py  # Architecture & experiment endpoints
│   │       ├── train.py         # Training endpoints
│   │       ├── evaluate.py      # Evaluation & report endpoints
│   │       ├── predict.py       # Interactive prediction endpoints
│   │       └── explain.py       # Explainability trace endpoints
│   ├── models/                  # Saved .keras weights & checkpoints
│   ├── datasets/                # Cached dataset CSVs
│   ├── experiments/             # JSON experiment history registry
│   └── outputs/                 # Evaluation reports
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.app.json
│   └── src/
│       ├── index.css            # Dark theme, glassmorphism & custom glowing tokens
│       ├── main.tsx
│       ├── App.tsx              # Master layout with module navigation
│       ├── types/index.ts       # Full TypeScript interfaces
│       ├── api/client.ts        # Typed API client
│       └── components/
│           ├── common/          # MetricCard, LoadingSpinner, Badge
│           ├── layout/          # Navbar, Animated Sidebar
│           ├── overview/        # Module 1: Overview Dashboard
│           ├── explorer/        # Module 2: Data Explorer (Plotly scatter & tables)
│           ├── architecture/    # Module 3: ANN Architecture Studio (Interactive graph)
│           ├── training/        # Module 4: Model Training Center (Recharts curves)
│           ├── evaluation/      # Module 5: Model Evaluation Center (Decision boundary & ROC)
│           ├── playground/      # Module 6: Prediction Playground (Coordinate inference)
│           └── explainability/  # Module 7: Model Explainability (Math & neuron heatmaps)
├── tests/
│   ├── test_dataset.py          # Data generation & split tests
│   ├── test_model.py            # Model architecture & prediction tests
│   └── test_api.py              # FastAPI endpoint tests
├── requirements.txt
└── README.md
```
