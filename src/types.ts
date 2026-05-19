export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  takenAt?: string;
  daysActive?: string[];
}

export interface FoodLog {
  id: string;
  time: string;
  mealType: "Café" | "Almoço" | "Jantar" | "Lanche";
  description: string;
  calories: number;
}

export type WearableStatus = "Aparelho Conectado" | "Conectando..." | "Desconectado";

export interface SimulatedHeartRatePreset {
  name: string;
  bpmRange: [number, number];
  description: string;
  icon: string;
  color: string;
}

export interface PromptOutput {
  overview: string;
  perfectPrompt: string;
  architecture: string;
  nativeIntegrationTips: string;
  snippet: string;
  isFallback?: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "water" | "medication" | "food" | "heart" | "system";
  actionText?: string;
}
