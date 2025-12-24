'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Clock, 
  Calendar, 
  LogOut, 
  Save, 
  Plus, 
  Trash2, 
  Edit2,
  X,
  Scissors
} from 'lucide-react'
import { 
  WeeklyHours, 
  HourException, 
  DAY_NAMES, 
  generateTimeOptions, 
  formatTimeForDisplay 
} from '@/lib/types'

const TIME_OPTIONS = generateTimeOptions()

export default function AdminPage() {
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>([])
  const [exceptions, setExceptions] = useState<HourException[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showExceptionModal, setShowExceptionModal] = useState(false)
  const [editingException, setEditingException] = useState<HourException | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  // Exception form state
  const [exceptionForm, setExceptionForm] = useState({
    date: '',
    label: '',
    type: 'closed' as 'closed' | 'modified',
    open_time: '09:00:00',
    close_time: '17:00:00',
    notes: ''
  })

  const fetchData = useCallback(async () => {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }

      // Fetch weekly hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('weekly_hours')
        .select('*')
        .order('day_of_week')

      if (hoursError) throw hoursError

      // If no data exists, initialize with defaults
      if (!hoursData || hoursData.length === 0) {
        const defaultHours = DAY_NAMES.map((_, idx) => ({
          id: crypto.randomUUID(),
          day_of_week: idx,
          is_closed: idx === 0, // Sunday closed
          open_time: idx === 0 ? null : idx === 6 ? '07:00:00' : '09:00:00',
          close_time: idx === 0 ? null : idx === 6 ? '12:00:00' : '17:00:00',
          updated_at: new Date().toISOString()
        }))
        setWeeklyHours(defaultHours)
      } else {
        setWeeklyHours(hoursData)
      }

      // Fetch exceptions (next 90 days)
      const today = new Date().toISOString().split('T')[0]
      const future = new Date()
      future.setDate(future.getDate() + 90)
      const futureDate = future.toISOString().split('T')[0]

      const { data: exceptionsData, error: exceptionsError } = await supabase
        .from('hour_exceptions')
        .select('*')
        .gte('date', today)
        .lte('date', futureDate)
        .order('date')

      if (exceptionsError) throw exceptionsError
      setExceptions(exceptionsData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  async function saveWeeklyHours() {
    setSaving(true)
    try {
      for (const hours of weeklyHours) {
        const { error } = await supabase
          .from('weekly_hours')
          .upsert({
            ...hours,
            updated_at: new Date().toISOString()
          }, { onConflict: 'day_of_week' })

        if (error) throw error
      }
      toast.success('Weekly hours saved!')
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Failed to save weekly hours')
    } finally {
      setSaving(false)
    }
  }

  function updateDayHours(dayIndex: number, field: keyof WeeklyHours, value: string | boolean | null) {
    setWeeklyHours(prev => prev.map(h => 
      h.day_of_week === dayIndex ? { ...h, [field]: value } : h
    ))
  }

  async function saveException() {
    // Validate
    if (!exceptionForm.date || !exceptionForm.label) {
      toast.error('Date and label are required')
      return
    }

    if (exceptionForm.type === 'modified') {
      if (!exceptionForm.open_time || !exceptionForm.close_time) {
        toast.error('Open and close times are required for modified hours')
        return
      }
      if (exceptionForm.close_time <= exceptionForm.open_time) {
        toast.error('Close time must be after open time')
        return
      }
    }

    setSaving(true)
    try {
      const exceptionData = {
        date: exceptionForm.date,
        label: exceptionForm.label,
        type: exceptionForm.type,
        open_time: exceptionForm.type === 'modified' ? exceptionForm.open_time : null,
        close_time: exceptionForm.type === 'modified' ? exceptionForm.close_time : null,
        notes: exceptionForm.notes || null,
        updated_at: new Date().toISOString()
      }

      if (editingException) {
        const { error } = await supabase
          .from('hour_exceptions')
          .update(exceptionData)
          .eq('id', editingException.id)

        if (error) throw error
        toast.success('Exception updated!')
      } else {
        const { error } = await supabase
          .from('hour_exceptions')
          .insert(exceptionData)

        if (error) throw error
        toast.success('Exception added!')
      }

      setShowExceptionModal(false)
      setEditingException(null)
      resetExceptionForm()
      fetchData()
    } catch (error) {
      console.error('Error saving exception:', error)
      toast.error('Failed to save exception')
    } finally {
      setSaving(false)
    }
  }

  async function deleteException(id: string) {
    if (!confirm('Delete this exception?')) return

    try {
      const { error } = await supabase
        .from('hour_exceptions')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Exception deleted!')
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Failed to delete exception')
    }
  }

  function resetExceptionForm() {
    setExceptionForm({
      date: '',
      label: '',
      type: 'closed',
      open_time: '09:00:00',
      close_time: '17:00:00',
      notes: ''
    })
  }

  function openEditException(exception: HourException) {
    setEditingException(exception)
    setExceptionForm({
      date: exception.date,
      label: exception.label,
      type: exception.type,
      open_time: exception.open_time || '09:00:00',
      close_time: exception.close_time || '17:00:00',
      notes: exception.notes || ''
    })
    setShowExceptionModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--barber-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-red)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--barber-bg)' }}>
      {/* Header */}
      <header className="border-b border-[var(--barber-border)] bg-[var(--barber-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-red)] to-[var(--accent-red-light)] flex items-center justify-center">
              <Scissors size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
              <p className="text-xs text-[var(--text-muted)]">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              View Site
            </a>
            <button onClick={handleLogout} className="admin-btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Weekly Hours Section */}
        <section className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-[var(--accent-blue)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Weekly Hours</h2>
            </div>
            <button 
              onClick={saveWeeklyHours} 
              disabled={saving}
              className="admin-btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Hours'}
            </button>
          </div>

          <div className="space-y-4">
            {weeklyHours.map((hours) => (
              <div 
                key={hours.day_of_week}
                className="grid grid-cols-[140px_100px_1fr_1fr] gap-4 items-center p-4 rounded-lg bg-[var(--barber-bg)] border border-[var(--barber-border)]"
              >
                <span className="font-medium text-[var(--text-primary)]">
                  {DAY_NAMES[hours.day_of_week]}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateDayHours(hours.day_of_week, 'is_closed', !hours.is_closed)}
                    className={`toggle-switch ${hours.is_closed ? 'active' : ''}`}
                  />
                  <span className="text-sm text-[var(--text-muted)]">
                    {hours.is_closed ? 'Closed' : 'Open'}
                  </span>
                </div>

                {!hours.is_closed && (
                  <>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">Open</label>
                      <select
                        value={hours.open_time || ''}
                        onChange={(e) => updateDayHours(hours.day_of_week, 'open_time', e.target.value)}
                        className="admin-select w-full"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">Close</label>
                      <select
                        value={hours.close_time || ''}
                        onChange={(e) => updateDayHours(hours.day_of_week, 'close_time', e.target.value)}
                        className="admin-select w-full"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {hours.is_closed && (
                  <div className="col-span-2 text-[var(--text-muted)] italic">
                    Closed all day
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Exceptions Section */}
        <section className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-[var(--accent-red)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Holiday / Special Hours</h2>
            </div>
            <button 
              onClick={() => {
                resetExceptionForm()
                setEditingException(null)
                setShowExceptionModal(true)
              }}
              className="admin-btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Exception
            </button>
          </div>

          {exceptions.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No upcoming exceptions scheduled</p>
              <p className="text-sm mt-2">Add holiday or special hours above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exceptions.map((exception) => (
                <div 
                  key={exception.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--barber-bg)] border border-[var(--barber-border)]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exception.type === 'closed' 
                        ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'
                        : 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]'
                    }`}>
                      {exception.type === 'closed' ? 'CLOSED' : 'MODIFIED'}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{exception.label}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {new Date(exception.date + 'T00:00:00').toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {exception.type === 'modified' && exception.open_time && exception.close_time && (
                          <span className="ml-2">
                            • {formatTimeForDisplay(exception.open_time)} - {formatTimeForDisplay(exception.close_time)}
                          </span>
                        )}
                      </p>
                      {exception.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">{exception.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditException(exception)}
                      className="p-2 rounded-lg hover:bg-[var(--barber-border)] transition-colors"
                    >
                      <Edit2 size={16} className="text-[var(--text-secondary)]" />
                    </button>
                    <button 
                      onClick={() => deleteException(exception.id)}
                      className="p-2 rounded-lg hover:bg-[var(--accent-red)]/20 transition-colors"
                    >
                      <Trash2 size={16} className="text-[var(--accent-red)]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Exception Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="admin-card w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {editingException ? 'Edit Exception' : 'Add Exception'}
              </h3>
              <button 
                onClick={() => {
                  setShowExceptionModal(false)
                  setEditingException(null)
                }}
                className="p-2 rounded-lg hover:bg-[var(--barber-border)] transition-colors"
              >
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={exceptionForm.date}
                  onChange={(e) => setExceptionForm(prev => ({ ...prev, date: e.target.value }))}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Label (e.g. Christmas Eve)
                </label>
                <input
                  type="text"
                  value={exceptionForm.label}
                  onChange={(e) => setExceptionForm(prev => ({ ...prev, label: e.target.value }))}
                  className="admin-input"
                  placeholder="Holiday name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={exceptionForm.type === 'closed'}
                      onChange={() => setExceptionForm(prev => ({ ...prev, type: 'closed' }))}
                      className="w-4 h-4 accent-[var(--accent-red)]"
                    />
                    <span className="text-[var(--text-primary)]">Closed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={exceptionForm.type === 'modified'}
                      onChange={() => setExceptionForm(prev => ({ ...prev, type: 'modified' }))}
                      className="w-4 h-4 accent-[var(--accent-blue)]"
                    />
                    <span className="text-[var(--text-primary)]">Modified Hours</span>
                  </label>
                </div>
              </div>

              {exceptionForm.type === 'modified' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Open Time
                    </label>
                    <select
                      value={exceptionForm.open_time}
                      onChange={(e) => setExceptionForm(prev => ({ ...prev, open_time: e.target.value }))}
                      className="admin-select w-full"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Close Time
                    </label>
                    <select
                      value={exceptionForm.close_time}
                      onChange={(e) => setExceptionForm(prev => ({ ...prev, close_time: e.target.value }))}
                      className="admin-select w-full"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={exceptionForm.notes}
                  onChange={(e) => setExceptionForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="admin-input h-20 resize-none"
                  placeholder="Any additional details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowExceptionModal(false)
                  setEditingException(null)
                }}
                className="admin-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={saveException}
                disabled={saving}
                className="admin-btn-primary flex-1"
              >
                {saving ? 'Saving...' : editingException ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

