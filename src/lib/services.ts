import { createClient } from '@/lib/supabase/server'
import { Service } from '@/lib/types'

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'default-1',
    name: 'Haircut',
    description: 'Classic haircut tailored to your style. Includes consultation, cut, and styling.',
    price: 10,
    icon: 'scissors',
    accent_color: 'red',
    display_order: 1,
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-2',
    name: 'Beard Trim',
    description: 'Professional beard shaping and trimming. Keep your facial hair looking sharp.',
    price: 8,
    icon: 'user',
    accent_color: 'blue',
    display_order: 2,
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-3',
    name: 'Senior Haircut',
    description: 'Quality haircut for our valued senior customers (65+). Same great service.',
    price: 9,
    icon: 'userCheck',
    accent_color: 'red',
    display_order: 3,
    is_active: true,
    updated_at: new Date().toISOString()
  }
]

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  
  if (!supabase) {
    return DEFAULT_SERVICES
  }
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error || !data || data.length === 0) {
    console.error('Error fetching services or no data, using defaults:', error)
    return DEFAULT_SERVICES
  }

  return data
}

