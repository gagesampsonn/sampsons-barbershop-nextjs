import { Scissors, MapPin, Phone, Star, Clock, Navigation, User, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { getWeeklyHours, getUpcomingExceptions, isCurrentlyOpen, formatHoursForDay } from '@/lib/hours'
import { DAY_NAMES, formatTimeForDisplay } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function HomePage() {
  const weeklyHours = await getWeeklyHours()
  const exceptions = await getUpcomingExceptions()
  const isOpen = isCurrentlyOpen(weeklyHours, exceptions)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-[var(--barber-bg)]/95 backdrop-blur-md border-b border-[var(--barber-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-red)] to-[var(--accent-red-light)] flex items-center justify-center shadow-glow-red">
                <span className="text-white font-bold text-xl font-sans">S</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight hidden sm:block font-sans">SAMPSON&apos;S</span>
            </a>

            <div className="hidden md:flex items-center gap-8 text-sm font-sans">
              <a href="#services" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Services</a>
              <a href="#gallery" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Styles</a>
              <a href="#hours" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Hours</a>
              <a href="#location" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Location</a>
            </div>

            <a 
              href="tel:740-357-0482"
              className="px-5 py-2 bg-[var(--accent-red)] hover:bg-[var(--accent-red-light)] text-white font-semibold rounded-lg text-sm transition-all shadow-glow-red font-sans"
            >
              Call Now
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--barber-surface)] to-[var(--barber-bg)]"></div>
          
          {/* Barber poles */}
          <div className="absolute left-4 top-20 bottom-20 w-4 hidden lg:block barber-stripe rounded-full opacity-60"></div>
          <div className="absolute right-4 top-20 bottom-20 w-4 hidden lg:block barber-stripe rounded-full opacity-60"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Established Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--barber-surface)] border border-[var(--barber-border)] mb-8">
                <span className="text-[var(--text-muted)] text-sm font-sans">Est. 2008</span>
                <span className="text-[var(--barber-border)]">|</span>
                <a href="https://www.google.com/maps/place/Sampson's+Barber+Shop/@38.73,-82.84,15z" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors font-sans">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className={i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400/50 text-yellow-400/50'} />
                    ))}
                  </div>
                  <span>4.5</span>
                  <span className="text-[var(--text-muted)]">| 95 Reviews</span>
                </a>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-sans">
                <span className="text-[var(--text-primary)]">SAMPSON&apos;S</span>
                <br />
                <span className="text-gradient-red">BARBERSHOP</span>
              </h1>
              
              <p className="text-xl text-[var(--text-secondary)] mb-2 italic">
                Traditional Cuts. Modern Style.
              </p>
              <p className="text-[var(--accent-red)] font-semibold mb-4 font-sans">Brian Sampson, Barber</p>
              <p className="text-[var(--text-muted)] max-w-xl mx-auto mb-8">
                Quality haircuts and grooming services in Wheelersburg, Ohio. Family-friendly barbershop. <span className="text-[var(--accent-blue)] font-semibold">Walk-ins only!</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <a href="#services" className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent-red)] hover:bg-[var(--accent-red-light)] text-white font-semibold rounded-xl text-lg transition-all shadow-glow-red font-sans">
                  <Scissors size={22} />
                  View Services
                </a>
                <a href="tel:740-357-0482" className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--barber-surface)] hover:bg-[var(--barber-elevated)] text-[var(--text-primary)] font-medium rounded-xl border border-[var(--barber-border)] transition-all font-sans">
                  <Phone size={20} />
                  (740) 357-0482
                </a>
              </div>

              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--barber-surface)] border border-[var(--barber-border)]">
                <MapPin size={18} className="text-[var(--accent-red)]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--text-primary)] font-sans">8520 Ohio River Road</p>
                  <p className="text-xs text-[var(--text-muted)] font-sans">Wheelersburg, OH 45694</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exterior Photo Section */}
        <section className="py-8 bg-[var(--barber-bg)]">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="relative w-full h-[280px] md:h-[380px] rounded-xl overflow-hidden vintage-frame">
              <Image 
                src="/exterior-color.jpg" 
                alt="Sampson's Barber Shop exterior"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-[var(--barber-surface)] border-t border-[var(--barber-border)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mb-12 text-center mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--barber-bg)] border border-[var(--barber-border)] text-[var(--text-secondary)] text-xs font-medium tracking-wide mb-4 font-sans">
                <Scissors size={14} className="text-[var(--accent-red)]" />
                Our Services
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-4 font-sans">
                Quality Cuts at <span className="text-gradient-red">Honest Prices</span>
              </h2>
              <p className="text-[var(--text-secondary)]">
                Professional barbering services for the whole family. No hidden fees.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Scissors, name: 'Haircut', price: 10, desc: 'Classic haircut tailored to your style. Includes consultation, cut, and styling.', accent: 'red' },
                { icon: User, name: 'Beard Trim', price: 8, desc: 'Professional beard shaping and trimming. Keep your facial hair looking sharp.', accent: 'blue' },
                { icon: UserCheck, name: 'Senior Haircut', price: 9, desc: 'Quality haircut for our valued senior customers (65+). Same great service.', accent: 'red' }
              ].map((service, idx) => (
                <div key={idx} className="group relative bg-[var(--barber-bg)] rounded-xl border border-[var(--barber-border)] p-8 hover:border-[var(--barber-border-light)] transition-all duration-300 text-center">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${service.accent === 'red' ? 'bg-[var(--accent-red)]' : 'bg-[var(--accent-blue)]'}`}></div>
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${service.accent === 'red' ? 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]' : 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'}`}>
                    <service.icon size={32} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 font-sans">{service.name}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">{service.desc}</p>
                  
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold font-sans ${service.accent === 'red' ? 'text-[var(--accent-red)]' : 'text-[var(--accent-blue)]'}`}>
                      ${service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--barber-bg)] border border-[var(--barber-border)] text-[var(--text-secondary)] text-sm font-sans">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Good for Kids
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--barber-bg)] border border-[var(--barber-border)] text-[var(--text-secondary)] text-sm font-sans">
                <span className="w-2 h-2 bg-[var(--accent-blue)] rounded-full"></span>
                Walk-ins Only
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--barber-bg)] border border-[var(--barber-border)] text-[var(--text-secondary)] text-sm font-sans">
                <span className="w-2 h-2 bg-[var(--accent-red)] rounded-full"></span>
                Cash &amp; Cards Accepted
              </div>
            </div>
          </div>
        </section>

        {/* Hairstyle Gallery Section */}
        <section id="gallery" className="py-20 bg-[var(--barber-bg)] border-t border-[var(--barber-border)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--barber-surface)] border border-[var(--barber-border)] text-[var(--text-secondary)] text-xs font-medium tracking-wide mb-4 font-sans">
                <Scissors size={14} className="text-[var(--accent-blue)]" />
                Style Guide
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-4 font-sans">
                Classic <span className="text-[var(--accent-blue)]">Barbershop</span> Styles
              </h2>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                Browse our style guides for inspiration. Just point to what you like and we&apos;ll make it happen.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="vintage-frame rounded-lg overflow-hidden bg-white">
                <Image 
                  src="/hairstyles-1.png" 
                  alt="Men's Clipper Cuts Guide"
                  width={400}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="vintage-frame rounded-lg overflow-hidden bg-white">
                <Image 
                  src="/hairstyles-2.png" 
                  alt="The Barber Hairstyle Guide"
                  width={400}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="vintage-frame rounded-lg overflow-hidden bg-white">
                <Image 
                  src="/hairstyles-3.png" 
                  alt="The Barber Hairstyle Guide"
                  width={400}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-20 bg-[var(--barber-surface)] border-t border-[var(--barber-border)]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="glass-panel rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Image src="/google-logo.svg" alt="Google" width={24} height={24} className="opacity-80" />
                <span className="text-[var(--text-muted)] text-sm font-sans">Google Reviews</span>
              </div>
              <div className="text-5xl font-bold text-[var(--text-primary)] mb-2 font-sans">4.5</div>
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={24} className={i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400/50 text-yellow-400/50'} />
                ))}
              </div>
              <p className="text-[var(--text-muted)] mb-6 font-sans">Based on 95 reviews</p>
              <a href="https://www.google.com/search?q=Sampson's+Barber+Shop+Wheelersburg+Ohio+reviews" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--barber-border)] hover:bg-[var(--barber-elevated)] transition-colors text-[var(--text-secondary)] font-sans">
                Read Reviews on Google
                <Navigation size={16} />
              </a>
            </div>
            
            <div className="glass-panel rounded-xl p-6">
              <p className="text-[var(--text-secondary)] italic mb-4">
                &quot;Great place for a haircut. Friendly staff and always does a great job. Been going here for years!&quot;
              </p>
              <p className="text-[var(--text-muted)] text-sm font-sans">— Happy Customer</p>
            </div>
          </div>
        </section>

        {/* Hours & Location Section */}
        <section id="hours" className="py-20 bg-[var(--barber-bg)] border-t border-[var(--barber-border)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Hours */}
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center gap-2 text-[var(--accent-blue)] mb-4">
                  <Clock size={20} />
                  <span className="text-sm font-medium font-sans">Business Hours</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 font-sans">When We&apos;re Open</h2>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 font-sans ${isOpen ? 'bg-green-500/20 text-green-400' : 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'}`}>
                  <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-[var(--accent-red)]'}`}></span>
                  {isOpen ? 'Open Now' : 'Closed'}
                </div>
                
                <div className="space-y-3">
                  {weeklyHours.map((hours) => (
                    <div key={hours.day_of_week} className="flex justify-between items-center py-2 border-b border-[var(--barber-border)] last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--text-primary)] font-medium font-sans">{DAY_NAMES[hours.day_of_week]}</span>
                        {!hours.is_closed && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] font-sans">Walk-in</span>
                        )}
                      </div>
                      <span className={`font-sans ${hours.is_closed ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>
                        {formatHoursForDay(hours)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-[var(--text-muted)] mt-6 pt-4 border-t border-[var(--barber-border)]">
                  Walk-ins welcome - No appointment needed!
                </p>
              </div>

              {/* Location */}
              <div id="location" className="glass-panel rounded-2xl p-8">
                <div className="flex items-center gap-2 text-[var(--accent-red)] mb-4">
                  <MapPin size={20} />
                  <span className="text-sm font-medium font-sans">Location</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-sans">Find Us Here</h2>
                
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-[var(--barber-surface)] border border-[var(--barber-border)]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3108.8!2d-82.84!3d38.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQzJzQ4LjAiTiA4MsKwNTAnMjQuMCJX!5e0!3m2!1sen!2sus!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--barber-bg)] border border-[var(--barber-border)]">
                    <MapPin size={20} className="text-[var(--accent-red)] flex-shrink-0 mt-1" />
                    <div className="flex-grow">
                      <p className="text-[var(--text-primary)] font-medium font-sans">8520 Ohio River Road</p>
                      <p className="text-[var(--text-muted)] text-sm font-sans">Wheelersburg, OH 45694</p>
                    </div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=8520+Ohio+River+Road+Wheelersburg+OH+45694" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[var(--barber-border)] transition-colors">
                      <Navigation size={18} className="text-[var(--accent-blue)]" />
                    </a>
                  </div>
                  
                  <a href="tel:740-357-0482" className="flex items-center gap-4 p-4 rounded-xl bg-[var(--barber-bg)] border border-[var(--barber-border)] hover:border-[var(--accent-blue)] transition-colors">
                    <Phone size={20} className="text-[var(--accent-blue)]" />
                    <div>
                      <p className="text-[var(--text-primary)] font-medium font-sans">(740) 357-0482</p>
                      <p className="text-[var(--text-muted)] text-sm font-sans">Tap to call</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Upcoming Exceptions */}
            {exceptions.length > 0 && (
              <div className="mt-12 glass-panel rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3 font-sans">
                  <Clock size={24} className="text-[var(--accent-red)]" />
                  Upcoming Holiday / Special Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exceptions.map((exception) => (
                    <div key={exception.id} className="p-4 rounded-xl bg-[var(--barber-bg)] border border-[var(--barber-border)]">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-2 font-sans ${exception.type === 'closed' ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]' : 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]'}`}>
                        {exception.type === 'closed' ? 'CLOSED' : 'MODIFIED HOURS'}
                      </div>
                      <p className="font-semibold text-[var(--text-primary)] font-sans">{exception.label}</p>
                      <p className="text-sm text-[var(--text-muted)] font-sans">
                        {new Date(exception.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {exception.type === 'modified' && exception.open_time && exception.close_time && (
                        <p className="text-sm text-[var(--accent-blue)] mt-1 font-sans">
                          {formatTimeForDisplay(exception.open_time)} - {formatTimeForDisplay(exception.close_time)}
                        </p>
                      )}
                      {exception.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-2">{exception.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Walk-ins Section */}
        <section className="py-20 bg-[var(--barber-surface)] border-t border-[var(--barber-border)]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--barber-bg)] border border-[var(--barber-border)] text-[var(--text-secondary)] text-xs font-medium tracking-wide mb-4 font-sans">
              <Scissors size={14} className="text-[var(--accent-red)]" />
              Walk-Ins Only
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-4 font-sans">
              How to Get a Cut
            </h2>
            
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-8">
              No appointment needed! Just <span className="text-[var(--accent-blue)] font-semibold">walk in</span> during business hours and we&apos;ll take care of you.
            </p>
            
            <div className="glass-panel rounded-xl p-8 max-w-2xl mx-auto mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-blue)]/10 flex items-center justify-center">
                  <Clock size={32} className="text-[var(--accent-blue)]" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-semibold text-[var(--text-primary)] font-sans">Walk-Ins Welcome</h3>
                  <p className="text-[var(--accent-blue)] font-medium font-sans">Monday - Saturday</p>
                </div>
              </div>
              <p className="text-[var(--text-muted)] mb-6 text-left">
                At Sampson&apos;s Barbershop, we keep it simple. No apps, no booking systems - just stop by during our business hours and we&apos;ll get you taken care of. First come, first served.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="px-4 py-2 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] text-sm font-medium font-sans">
                  No appointments
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium font-sans">
                  First come, first served
                </div>
                <div className="px-4 py-2 rounded-full bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-sm font-medium font-sans">
                  Family friendly
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-8 max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-sans">
                Ready for a Fresh Cut?
              </h3>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Stop by during business hours. Brian Sampson is ready to give you a great haircut!
              </p>
              
              <a
                href="#hours"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-[var(--accent-red)] hover:bg-[var(--accent-red-light)] text-white font-semibold rounded-xl text-lg transition-all shadow-glow-red font-sans"
              >
                <Clock size={22} />
                View Hours
              </a>
              
              <div className="mt-10 pt-8 border-t border-[var(--barber-border)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent-red)] font-sans">$10</p>
                    <p className="text-[var(--text-muted)] text-sm font-sans">Haircut</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent-blue)] font-sans">$8</p>
                    <p className="text-[var(--text-muted)] text-sm font-sans">Beard Trim</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent-red)] font-sans">$9</p>
                    <p className="text-[var(--text-muted)] text-sm font-sans">Senior Cut</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-[var(--text-muted)] text-sm">
              Serving Wheelersburg since 2008 | Brian Sampson, Barber
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--barber-bg)] border-t border-[var(--barber-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-red)] to-[var(--accent-red-light)] flex items-center justify-center">
                  <span className="text-white font-bold text-xl font-sans">S</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight block font-sans">SAMPSON&apos;S</span>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-sans">Barbershop</span>
                </div>
              </div>
              <p className="text-sm text-[var(--accent-red)] font-semibold mb-2 font-sans">Brian Sampson, Barber</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
                Traditional cuts with modern style. Serving the Wheelersburg community with quality haircuts and grooming services. Walk-ins only!
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4 font-sans">Contact</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                <li>
                  <a href="tel:740-357-0482" className="flex items-center gap-2 hover:text-[var(--text-secondary)] transition-colors font-sans">
                    <Phone size={14} className="text-[var(--accent-blue)]" />
                    (740) 357-0482
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-[var(--accent-red)] mt-0.5" />
                  <span className="font-sans">
                    8520 Ohio River Road<br />
                    Wheelersburg, OH 45694
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4 font-sans">Hours</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)] font-sans">
                <li className="flex items-center gap-2">
                  <Clock size={14} className="text-[var(--accent-blue)]" />
                  <span>Mon-Fri: 9 AM - 5 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={14} className="text-[var(--accent-blue)]" />
                  <span>Saturday: 7 AM - 12 PM</span>
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <Clock size={14} />
                  <span>Sunday: Closed</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--barber-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--text-muted)] font-sans">
              &copy; {new Date().getFullYear()} Sampson&apos;s Barbershop. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-sans">
              <span className="w-1.5 h-1.5 bg-[var(--accent-red)] rounded-full"></span>
              <span>Wheelersburg, Ohio</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
