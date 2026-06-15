import {
  FREQUENCY_LABELS,
  WEEK_DAY_OPTIONS,
  type CleaningFrequencyType,
  type MonitoringFormValue,
} from "../types/monitoring";

type MonitoringFieldsProps = {
  value: MonitoringFormValue;
  onChange: (value: MonitoringFormValue) => void;
};

export function MonitoringFields({ value, onChange }: MonitoringFieldsProps) {
  function update<Key extends keyof MonitoringFormValue>(
    field: Key,
    fieldValue: MonitoringFormValue[Key]
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function toggleWeeklyDay(day: string) {
    update(
      "weeklyDays",
      value.weeklyDays.includes(day)
        ? value.weeklyDays.filter((item) => item !== day)
        : [...value.weeklyDays, day]
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-bold text-slate-950">Monitoramento da limpeza</h3>
          <p className="mt-1 text-xs text-slate-600">
            Define quando a entidade entra nas pendências do dashboard.
          </p>
        </div>

        <select
          value={value.monitoringEnabled ? "true" : "false"}
          onChange={(event) =>
            update("monitoringEnabled", event.target.value === "true")
          }
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="true">Monitorar no dashboard</option>
          <option value="false">Não monitorar</option>
        </select>
      </div>

      <div className={value.monitoringEnabled ? "mt-4 space-y-4" : "mt-4 space-y-4 opacity-60"}>
        <div>
          <label className="text-sm font-semibold text-slate-800">
            Tipo de frequência
          </label>
          <select
            value={value.frequencyType}
            onChange={(event) =>
              update(
                "frequencyType",
                event.target.value as CleaningFrequencyType
              )
            }
            disabled={!value.monitoringEnabled}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed"
          >
            {Object.entries(FREQUENCY_LABELS).map(([frequency, label]) => (
              <option key={frequency} value={frequency}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {value.frequencyType === "DAILY" && (
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Limpezas esperadas por dia
            </label>
            <input
              type="number"
              min="1"
              value={value.expectedCleaningsPerDay}
              onChange={(event) =>
                update("expectedCleaningsPerDay", event.target.value)
              }
              disabled={!value.monitoringEnabled}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        )}

        {value.frequencyType === "WEEKLY" && (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Dias esperados
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEK_DAY_OPTIONS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={value.weeklyDays.includes(day.value)}
                    onChange={() => toggleWeeklyDay(day.value)}
                    disabled={!value.monitoringEnabled}
                    className="accent-emerald-700"
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {value.frequencyType === "MONTHLY" && (
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Dias do mês
            </label>
            <input
              value={value.monthlyDays}
              onChange={(event) => update("monthlyDays", event.target.value)}
              disabled={!value.monitoringEnabled}
              placeholder="Ex: 1, 15, 30"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        )}

        {value.frequencyType === "CUSTOM" && (
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Intervalo em horas
            </label>
            <input
              type="number"
              min="1"
              value={value.customIntervalHours}
              onChange={(event) =>
                update("customIntervalHours", event.target.value)
              }
              disabled={!value.monitoringEnabled}
              placeholder="Ex: 12"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        )}

        {value.frequencyType === "AFTER_USE" && (
          <p className="rounded-xl bg-white p-3 text-sm text-slate-600">
            Rotinas após uso não geram pendência automática.
          </p>
        )}

        <div>
          <label className="text-sm font-semibold text-slate-800">
            Observações do monitoramento
          </label>
          <textarea
            value={value.monitoringNotes}
            onChange={(event) => update("monitoringNotes", event.target.value)}
            rows={3}
            placeholder="Orientações adicionais para acompanhamento"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
    </section>
  );
}
