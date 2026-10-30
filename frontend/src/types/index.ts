export interface DatasetSample {
  id: number;
  x1: number;
  x2: number;
  label: number;
  split: 'train' | 'test';
}

export interface DatasetFeatureStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  q25: number;
  median: number;
  q75: number;
}

export interface DatasetResponse {
  total_samples: number;
  n_train: number;
  n_test: number;
  noise: number;
  class_0_count: number;
  class_1_count: number;
  class_0_percentage: number;
  class_1_percentage: number;
  feature_stats: Record<string, DatasetFeatureStats>;
  preview: DatasetSample[];
  scatter_sample: DatasetSample[];
}

export interface LayerDetail {
  name: string;
  layer_type: string;
  neurons: number;
  activation: string;
  params: number;
  shape: (number | null)[];
}

export interface ArchitectureResponse {
  layers: LayerDetail[];
  total_params: number;
  trainable_params: number;
  optimizer: string;
  loss_function: string;
  metrics: string[];
  input_shape: number[];
  output_shape: number[];
}

export interface TrainingHistoryPoint {
  epoch: number;
  loss: number;
  val_loss: number;
  accuracy: number;
  val_accuracy: number;
}

export interface TrainingResponse {
  experiment_id: string;
  status: string;
  epochs_trained: number;
  best_val_loss: number;
  best_val_accuracy: number;
  stopped_early: boolean;
  history: TrainingHistoryPoint[];
  duration_seconds: number;
  message: string;
}

export interface EvaluationResponse {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  confusion_matrix: number[][];
  classification_report: Record<string, any>;
  roc_curve: {
    fpr: number[];
    tpr: number[];
    thresholds: number[];
  };
  decision_boundary: {
    x_vals: number[];
    y_vals: number[];
    grid_z: number[][];
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
  test_points: {
    x1: number;
    x2: number;
    true_label: number;
    pred_label: number;
    prob: number;
    correct: boolean;
  }[];
  metrics_summary: Record<string, number>;
}

export interface PredictResponse {
  x1: number;
  x2: number;
  raw_probability: number;
  probability_class_1: number;
  probability_class_0: number;
  predicted_class: number;
  confidence: number;
  label_text: string;
  distance_to_boundary: number;
  status: string;
}

export interface LayerActivationTrace {
  layer_index: number;
  layer_name: string;
  num_neurons: number;
  activation_type: string;
  pre_activations: number[];
  post_activations: number[];
}

export interface ExplainResponse {
  input_features: number[];
  predicted_class: number;
  probability: number;
  layer_traces: LayerActivationTrace[];
  decision_rational: string;
  mathematical_breakdown: {
    input_vector: number[];
    layer_1_active_neurons: number;
    layer_1_total_neurons: number;
    layer_2_active_neurons: number;
    layer_2_total_neurons: number;
    layer_3_active_neurons: number;
    layer_3_total_neurons: number;
    output_logit_z: number;
    output_sigmoid_prob: number;
    binary_cross_entropy: {
      formula: string;
      loss_if_true_label_0: number;
      loss_if_true_label_1: number;
    };
  };
  concepts_summary: Record<string, string>;
}

export interface OverviewData {
  total_training_samples: number;
  total_testing_samples: number;
  model_accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  training_status: string;
  model_health: {
    status: string;
    score: number;
    loss: number;
    is_calibrated: boolean;
  };
  recent_experiment: any;
  dataset_info: {
    noise: number;
    samples: number;
    random_state: number;
  };
}

export interface ExperimentRecord {
  id: string;
  timestamp: string;
  epochs: number;
  max_epochs: number;
  learning_rate: number;
  batch_size: number;
  noise: number;
  samples: number;
  stopped_early: boolean;
  best_val_loss: number;
  best_val_accuracy: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  duration_seconds: number;
  status: string;
}
