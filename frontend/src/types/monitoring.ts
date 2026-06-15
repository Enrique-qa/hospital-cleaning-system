export type CleaningFrequencyType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "AFTER_USE"
  | "CUSTOM";

export type MonitoringFormValue = {
  monitoringEnabled: boolean;
  frequencyType: CleaningFrequencyType;
  expectedCleaningsPerDay: string;
  weeklyDays: string[];
  monthlyDays: string;
  customIntervalHours: string;
  monitoringNotes: string;
};

export type MonitoringStatus = {
  status: "OK" | "PENDING" | "NOT_MONITORED";
  label: string;
  expected: number | null;
  completed: number;
  lastCleaningAt: string | null;
  reason: string;
};

export const INITIAL_MONITORING: MonitoringFormValue = {
  monitoringEnabled: true,
  frequencyType: "DAILY",
  expectedCleaningsPerDay: "1",
  weeklyDays: [],
  monthlyDays: "",
  customIntervalHours: "",
  monitoringNotes: "",
};

export const FREQUENCY_LABELS: Record<CleaningFrequencyType, string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  AFTER_USE: "Após uso",
  CUSTOM: "Personalizada por intervalo",
};

export const WEEK_DAY_OPTIONS = [
  { value: "MONDAY", label: "Segunda" },
  { value: "TUESDAY", label: "Terça" },
  { value: "WEDNESDAY", label: "Quarta" },
  { value: "THURSDAY", label: "Quinta" },
  { value: "FRIDAY", label: "Sexta" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

export function parseMonthlyDays(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31)
    ),
  ].sort((a, b) => a - b);
}

export function getMonitoringPayload(value: MonitoringFormValue) {
  return {
    monitoringEnabled: value.monitoringEnabled,
    frequencyType: value.frequencyType,
    expectedCleaningsPerDay:
      value.frequencyType === "DAILY"
        ? Number(value.expectedCleaningsPerDay)
        : null,
    weeklyDays: value.frequencyType === "WEEKLY" ? value.weeklyDays : [],
    monthlyDays:
      value.frequencyType === "MONTHLY"
        ? parseMonthlyDays(value.monthlyDays)
        : [],
    customIntervalHours:
      value.frequencyType === "CUSTOM"
        ? Number(value.customIntervalHours)
        : null,
    monitoringNotes: value.monitoringNotes.trim() || null,
  };
}

export function validateMonitoring(value: MonitoringFormValue) {
  if (!value.monitoringEnabled || value.frequencyType === "AFTER_USE") return "";

  if (
    value.frequencyType === "DAILY" &&
    (!Number.isInteger(Number(value.expectedCleaningsPerDay)) ||
      Number(value.expectedCleaningsPerDay) < 1)
  ) {
    return "Informe quantas limpezas são esperadas por dia.";
  }

  if (value.frequencyType === "WEEKLY" && value.weeklyDays.length === 0) {
    return "Selecione ao menos um dia para a rotina semanal.";
  }

  if (
    value.frequencyType === "MONTHLY" &&
    parseMonthlyDays(value.monthlyDays).length === 0
  ) {
    return "Informe ao menos um dia válido para a rotina mensal.";
  }

  if (
    value.frequencyType === "CUSTOM" &&
    (!Number.isInteger(Number(value.customIntervalHours)) ||
      Number(value.customIntervalHours) < 1)
  ) {
    return "Informe um intervalo válido em horas.";
  }

  return "";
}

export function describeMonitoringRule(entity: {
  monitoringEnabled: boolean;
  frequencyType: CleaningFrequencyType;
  expectedCleaningsPerDay?: number | null;
  weeklyDays?: string[] | null;
  monthlyDays?: number[] | null;
  customIntervalHours?: number | null;
}) {
  if (!entity.monitoringEnabled) return "Não participa do monitoramento";
  if (entity.frequencyType === "AFTER_USE") return "Registrar após cada uso";
  if (entity.frequencyType === "DAILY") {
    return `${entity.expectedCleaningsPerDay ?? 1} limpeza(s) por dia`;
  }
  if (entity.frequencyType === "CUSTOM") {
    return `A cada ${entity.customIntervalHours ?? "—"} hora(s)`;
  }
  if (entity.frequencyType === "MONTHLY") {
    return `Dias ${(entity.monthlyDays ?? []).join(", ") || "não informados"}`;
  }

  const labels = new Map(WEEK_DAY_OPTIONS.map((day) => [day.value, day.label]));
  return (entity.weeklyDays ?? []).map((day) => labels.get(day) ?? day).join(", ");
}
