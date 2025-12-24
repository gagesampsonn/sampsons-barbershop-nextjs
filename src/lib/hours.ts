import { createClient } from '@/lib/supabase/server'
import { WeeklyHours, HourException, DAY_NAMES, formatTimeForDisplay } from '@/lib/types'

const DEFAULT_HOURS: WeeklyHours[] = DAY_NAMES.map((_, idx) => ({
  id: `default-${idx}`,
  day_of_week: idx,
  is_closed: idx === 0,
  open_time: idx === 0 ? null : idx === 6 ? '07:00:00' : '09:00:00',
  close_time: idx === 0 ? null : idx === 6 ? '12:00:00' : '17:00:00',
  updated_at: new Date().toISOString()
}))

export async function getWeeklyHours(): Promise<WeeklyHours[]> {
  const supabase = await createClient()
  
  if (!supabase) {
    return DEFAULT_HOURS
  }
  
  const { data, error } = await supabase
    .from('weekly_hours')
    .select('*')
    .order('day_of_week')

  if (error || !data || data.length === 0) {
    return DEFAULT_HOURS
  }

  return data
}

export async function getUpcomingExceptions(): Promise<HourException[]> {
  const supabase = await createClient()
  
  if (!supabase) {
    return []
  }
  
  const today = new Date().toISOString().split('T')[0]
  const future = new Date()
  future.setDate(future.getDate() + 90)
  const futureDate = future.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('hour_exceptions')
    .select('*')
    .gte('date', today)
    .lte('date', futureDate)
    .order('date')

  if (error) {
    console.error('Error fetching exceptions:', error)
    return []
  }

  return data || []
}

export function isCurrentlyOpen(weeklyHours: WeeklyHours[], exceptions: HourException[]): boolean {
  const now = new Date()
  // Use America/New_York timezone
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const dayOfWeek = nyTime.getDay()
  const currentHour = nyTime.getHours()
  const currentMinute = nyTime.getMinutes()
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`
  
  // Check for exception today
  const todayStr = nyTime.toISOString().split('T')[0]
  const todayException = exceptions.find(e => e.date === todayStr)
  
  if (todayException) {
    if (todayException.type === 'closed') return false
    if (todayException.open_time && todayException.close_time) {
      return currentTimeStr >= todayException.open_time && currentTimeStr < todayException.close_time
    }
  }
  
  // Check regular hours
  const todayHours = weeklyHours.find(h => h.day_of_week === dayOfWeek)
  if (!todayHours || todayHours.is_closed) return false
  if (!todayHours.open_time || !todayHours.close_time) return false
  
  return currentTimeStr >= todayHours.open_time && currentTimeStr < todayHours.close_time
}

export function formatHoursForDay(hours: WeeklyHours): string {
  if (hours.is_closed) return 'Closed'
  if (!hours.open_time || !hours.close_time) return 'Closed'
  return `${formatTimeForDisplay(hours.open_time)} - ${formatTimeForDisplay(hours.close_time)}`
}
