export const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export const FREQUENCY_TYPES = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "AFTER_USE",
  "CUSTOM",
] as const;

export type CleaningFrequencyTypeValue = (typeof FREQUENCY_TYPES)[number];
export type CleaningMonitoringStatus = "OK" | "PENDING" | "NOT_MONITORED";

type MonitorableEntity = {
  monitoringEnabled: boolean;
  frequencyType: CleaningFrequencyTypeValue;
  expectedCleaningsPerDay: number | null;
  weeklyDays: unknown;
  monthlyDays: unknown;
  customIntervalHours: number | null;
};

type CleaningRecordLike = {
  cleanedAt: Date;
};

export type EntityCleaningStatus = {
  status: CleaningMonitoringStatus;
  label: string;
  expected: number | null;
  completed: number;
  lastCleaningAt: Date | null;
  reason: string;
};

export function getTodayRange(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getNumberArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is number => Number.isInteger(item))
    : [];
}

function result(
  status: CleaningMonitoringStatus,
  expected: number | null,
  completed: number,
  lastCleaningAt: Date | null,
  reason: string,
  label?: string
): EntityCleaningStatus {
  return {
    status,
    label:
      label ??
      (status === "OK"
        ? "Dentro da rotina"
        : status === "PENDING"
          ? "Fora da rotina"
          : "Sem registro esperado"),
    expected,
    completed,
    lastCleaningAt,
    reason,
  };
}

export function getEntityCleaningStatus(
  entity: MonitorableEntity,
  records: CleaningRecordLike[],
  now = new Date()
): EntityCleaningStatus {
  const orderedRecords = [...records].sort(
    (a, b) => b.cleanedAt.getTime() - a.cleanedAt.getTime()
  );
  const lastCleaningAt = orderedRecords[0]?.cleanedAt ?? null;
  const { start, end } = getTodayRange(now);
  const completedToday = orderedRecords.filter(
    (record) => record.cleanedAt >= start && record.cleanedAt <= end
  ).length;

  if (!entity.monitoringEnabled) {
    return result(
      "NOT_MONITORED",
      null,
      completedToday,
      lastCleaningAt,
      "Esta entidade não participa do monitoramento automático.",
      "Não monitorado"
    );
  }

  if (entity.frequencyType === "AFTER_USE") {
    return result(
      "NOT_MONITORED",
      null,
      completedToday,
      lastCleaningAt,
      "A limpeza deve ser registrada após o uso e não gera pendência automática.",
      "Após uso"
    );
  }

  if (entity.frequencyType === "WEEKLY") {
    const expectedToday = getStringArray(entity.weeklyDays).includes(
      WEEK_DAYS[now.getDay()]
    );

    if (!expectedToday) {
      return result(
        "NOT_MONITORED",
        0,
        completedToday,
        lastCleaningAt,
        "Não há limpeza semanal programada para hoje."
      );
    }

    return completedToday >= 1
      ? result(
          "OK",
          1,
          completedToday,
          lastCleaningAt,
          "Limpeza semanal esperada hoje já registrada."
        )
      : result(
          "PENDING",
          1,
          completedToday,
          lastCleaningAt,
          "Limpeza semanal esperada hoje ainda não registrada."
        );
  }

  if (entity.frequencyType === "MONTHLY") {
    const expectedToday = getNumberArray(entity.monthlyDays).includes(
      now.getDate()
    );

    if (!expectedToday) {
      return result(
        "NOT_MONITORED",
        0,
        completedToday,
        lastCleaningAt,
        "Não há limpeza mensal programada para hoje."
      );
    }

    return completedToday >= 1
      ? result(
          "OK",
          1,
          completedToday,
          lastCleaningAt,
          "Limpeza mensal esperada hoje já registrada."
        )
      : result(
          "PENDING",
          1,
          completedToday,
          lastCleaningAt,
          "Limpeza mensal esperada hoje ainda não registrada."
        );
  }

  if (entity.frequencyType === "CUSTOM") {
    const interval = entity.customIntervalHours;

    if (!interval || interval < 1) {
      return result(
        "NOT_MONITORED",
        null,
        completedToday,
        lastCleaningAt,
        "Intervalo personalizado ainda não configurado.",
        "Configuração incompleta"
      );
    }

    if (!lastCleaningAt) {
      return result(
        "PENDING",
        1,
        completedToday,
        null,
        `Nenhuma limpeza registrada; limite configurado em ${interval}h.`
      );
    }

    const elapsedHours = Math.max(
      0,
      Math.floor((now.getTime() - lastCleaningAt.getTime()) / 3_600_000)
    );

    return elapsedHours >= interval
      ? result(
          "PENDING",
          1,
          completedToday,
          lastCleaningAt,
          `Última limpeza há ${elapsedHours}h, limite ${interval}h.`
        )
      : result(
          "OK",
          1,
          completedToday,
          lastCleaningAt,
          `Última limpeza há ${elapsedHours}h, dentro do limite de ${interval}h.`
        );
  }

  const expected = Math.max(1, entity.expectedCleaningsPerDay ?? 1);

  return completedToday >= expected
    ? result(
        "OK",
        expected,
        completedToday,
        lastCleaningAt,
        `Esperadas ${expected} limpezas hoje, realizadas ${completedToday}.`
      )
    : result(
        "PENDING",
        expected,
        completedToday,
        lastCleaningAt,
        `Esperadas ${expected} limpezas hoje, realizadas ${completedToday}.`
      );
}
