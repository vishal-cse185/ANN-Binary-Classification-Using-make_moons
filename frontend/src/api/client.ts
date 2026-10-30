import {
  DatasetResponse,
  ArchitectureResponse,
  TrainingResponse,
  EvaluationResponse,
  PredictResponse,
  ExplainResponse,
  OverviewData,
  ExperimentRecord
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) errMessage = errData.detail;
      else if (errData.error) errMessage = errData.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errMessage);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Health
  checkHealth: async () => {
    return handleResponse<{ status: string; service: string }>(await fetch(`${BASE_URL}/health`));
  },

  // Overview
  getOverview: async (): Promise<OverviewData> => {
    return handleResponse<OverviewData>(await fetch(`${BASE_URL}/model/overview`));
  },

  // Dataset
  getCurrentDataset: async (): Promise<DatasetResponse> => {
    return handleResponse<DatasetResponse>(await fetch(`${BASE_URL}/dataset/current`));
  },

  generateDataset: async (params: {
    n_samples: number;
    noise: number;
    random_state: number;
    test_size: number;
  }): Promise<DatasetResponse> => {
    return handleResponse<DatasetResponse>(
      await fetch(`${BASE_URL}/dataset/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
    );
  },

  downloadDatasetCsv: () => {
    window.open(`${BASE_URL}/dataset/download`, '_blank');
  },

  // Architecture & Experiments
  getArchitecture: async (): Promise<ArchitectureResponse> => {
    return handleResponse<ArchitectureResponse>(await fetch(`${BASE_URL}/model/architecture`));
  },

  getExperiments: async (): Promise<ExperimentRecord[]> => {
    return handleResponse<ExperimentRecord[]>(await fetch(`${BASE_URL}/model/experiments`));
  },

  // Training
  trainModel: async (params: {
    epochs: number;
    learning_rate: number;
    batch_size: number;
    early_stopping: boolean;
    patience: number;
    noise: number;
    n_samples: number;
    random_state: number;
  }): Promise<TrainingResponse> => {
    return handleResponse<TrainingResponse>(
      await fetch(`${BASE_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
    );
  },

  getTrainingStatus: async () => {
    return handleResponse<{
      is_training: boolean;
      current_epoch: number;
      total_epochs: number;
      progress_percentage: number;
      experiment_id: string;
    }>(await fetch(`${BASE_URL}/train/status`));
  },

  // Evaluation
  getEvaluation: async (): Promise<EvaluationResponse> => {
    return handleResponse<EvaluationResponse>(await fetch(`${BASE_URL}/evaluate`));
  },

  downloadEvaluationReport: () => {
    window.open(`${BASE_URL}/evaluate/report/download`, '_blank');
  },

  // Prediction
  predict: async (x1: number, x2: number): Promise<PredictResponse> => {
    return handleResponse<PredictResponse>(
      await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x1, x2 }),
      })
    );
  },

  // Explainability
  explain: async (x1: number, x2: number): Promise<ExplainResponse> => {
    return handleResponse<ExplainResponse>(
      await fetch(`${BASE_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x1, x2 }),
      })
    );
  },
};
