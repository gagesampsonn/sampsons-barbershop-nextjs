const TIME_SLOTS = ['9–10 AM', '10–12 PM', '12–2 PM', '2–4 PM', '4–5 PM'] as const

const WEEKLY_BUSYNESS = [
  { day: 'Monday', levels: [1, 2, 2, 1, 2] },
  { day: 'Tuesday', levels: [1, 1, 2, 1, 2] },
  { day: 'Wednesday', levels: [1, 2, 2, 2, 2] },
  { day: 'Thursday', levels: [1, 2, 2, 1, 2] },
  { day: 'Friday', levels: [2, 2, 3, 2, 3] },
  { day: 'Saturday', levels: [3, 3, 0, 0, 0] },
  { day: 'Sunday', levels: [0, 0, 0, 0, 0] },
] as const

function levelMeta(level: number) {
  switch (level) {
    case 0:
      return { label: 'Closed', cell: 'bg-[var(--barber-elevated)] text-[var(--text-muted)]' }
    case 1:
      return { label: 'Quiet', cell: 'bg-[#e8efe4] text-[#3d5c3d] font-medium' }
    case 2:
      return { label: 'Moderate', cell: 'bg-[#f3ead8] text-[#5c4d32] font-medium' }
    case 3:
      return { label: 'Busy', cell: 'bg-[#ede0e0] text-[var(--accent-red)] font-medium' }
    default:
      return { label: '—', cell: 'bg-[var(--barber-surface)]' }
  }
}

export function BusyTimesChart() {
  return (
    <div className="surface p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-sm text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 bg-[#e8efe4] border border-[var(--barber-border)]" aria-hidden />
          Quiet
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 bg-[#f3ead8] border border-[var(--barber-border)]" aria-hidden />
          Moderate
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 bg-[#ede0e0] border border-[var(--barber-border)]" aria-hidden />
          Busy
        </span>
      </div>

      {/* Mobile: one card per day — no horizontal scroll */}
      <div className="md:hidden space-y-3">
        {WEEKLY_BUSYNESS.map((row) => {
          const allClosed = row.levels.every((l) => l === 0)
          return (
            <div
              key={row.day}
              className="border border-[var(--barber-border)] rounded-[4px] bg-[var(--barber-surface)] overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-[var(--barber-border)] bg-[var(--barber-elevated)]">
                <p className="font-medium text-[var(--text-primary)]">{row.day}</p>
              </div>
              {allClosed ? (
                <p className="px-4 py-3 text-sm text-[var(--text-muted)]">Closed all day</p>
              ) : (
                <ul className="divide-y divide-[var(--barber-border)]">
                  {row.levels.map((level, i) => {
                    const meta = levelMeta(level)
                    return (
                      <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                        <span className="text-[var(--text-secondary)]">{TIME_SLOTS[i]}</span>
                        <span className={`px-2.5 py-0.5 rounded-[4px] text-xs shrink-0 ${meta.cell}`}>
                          {meta.label}
                        </span>
                      </li>
                    )
                  })}
                  {row.day === 'Saturday' && (
                    <li className="px-4 py-2 text-xs text-[var(--text-muted)] bg-[var(--barber-elevated)]">
                      Shop hours: 7 AM – 12 PM
                    </li>
                  )}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop: readable table with labels in every cell */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--barber-border)]">
              <th className="text-left py-3 pr-4 font-medium text-[var(--text-muted)] w-28" scope="col">
                Day
              </th>
              {TIME_SLOTS.map((slot) => (
                <th
                  key={slot}
                  scope="col"
                  className="py-3 px-2 text-center font-medium text-[var(--text-muted)] text-xs"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKLY_BUSYNESS.map((row) => (
              <tr key={row.day} className="border-b border-[var(--barber-border)] last:border-0">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-[var(--text-primary)]">
                  {row.day}
                </th>
                {row.levels.map((level, i) => {
                  const meta = levelMeta(level)
                  return (
                    <td key={i} className="py-2 px-1">
                      <span
                        className={`block text-center text-xs py-2 px-1 rounded-[4px] ${meta.cell}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--barber-border)] grid sm:grid-cols-2 gap-5 text-sm">
        <div>
          <p className="font-medium text-[var(--text-primary)] mb-1">Best time</p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Weekday mornings (9–10 AM) are typically the quietest.
          </p>
        </div>
        <div>
          <p className="font-medium text-[var(--text-primary)] mb-1">Busiest time</p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Saturday mornings and Friday afternoons tend to be busiest.
          </p>
        </div>
      </div>
    </div>
  )
}
