export interface WeeklyHours {
  id: string
  day_of_week: number
  is_closed: boolean
  open_time: string | null
  close_time: string | null
  updated_at: string
}

export interface HourException {
  id: string
  date: string
  type: 'closed' | 'modified'
  open_time: string | null
  close_time: string | null
  label: string
  notes: string | null
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  icon: 'scissors' | 'user' | 'userCheck'
  accent_color: 'red' | 'blue'
  display_order: number
  is_active: boolean
  updated_at: string
}

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      times.push(`${h}:${m}:00`)
    }
  }
  return times
}

export function formatTime(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${minutes} ${ampm}`
}

export function formatTimeForDisplay(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${minutes} ${ampm}`
}

