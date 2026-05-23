import { MapPin, Phone, Star, Clock, Navigation, AlertTriangle, Calendar } from 'lucide-react'
import Image from 'next/image'
import { getWeeklyHours, getUpcomingExceptions, isCurrentlyOpen, formatHoursForDay } from '@/lib/hours'
import { getServices } from '@/lib/services'
import { DAY_NAMES, formatTimeForDisplay } from '@/lib/types'
import { SectionIntro } from '@/components/SectionIntro'
import { BusyTimesChart } from '@/components/BusyTimesChart'
import { SiteNav } from '@/components/SiteNav'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function HomePage() {
  const weeklyHours = await getWeeklyHours()
  const exceptions = await getUpcomingExceptions()
  const services = await getServices()
  const isOpen = isCurrentlyOpen(weeklyHours, exceptions)

  const nextException = exceptions.length > 0 ? exceptions[0] : null

  const formatExceptionDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.getTime() === today.getTime()) return 'Today'
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--barber-bg)]">
      {nextException && (
        <div
          className={`border-b border-[var(--barber-border)] ${
            nextException.type === 'closed' ? 'bg-[var(--accent-red)] text-white' : 'bg-[var(--accent-blue)] text-white'
          }`}
        >
          <div className="max-w-6xl mx-auto px-6 py-2.5">
            <p className="text-sm text-center">
              {nextException.type === 'closed' && (
                <AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" aria-hidden />
              )}
              {nextException.type === 'modified' && (
                <Calendar size={14} className="inline mr-1.5 -mt-0.5" aria-hidden />
              )}
              <span className="font-medium">{nextException.label}</span>
              <span className="mx-2 opacity-70">·</span>
              <span>{formatExceptionDate(nextException.date)}</span>
              <span className="mx-2 opacity-70">·</span>
              {nextException.type === 'closed' ? (
                <span>We&apos;ll be closed</span>
              ) : (
                <span>
                  Special hours: {formatTimeForDisplay(nextException.open_time)} – {formatTimeForDisplay(nextException.close_time)}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <SiteNav />

      <main className="flex-grow">
        {/* Hero — logo + copy on cream; photo below */}
        <section className="border-b border-[var(--barber-border)] bg-[var(--barber-surface)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <Image
              src="/logo.png"
              alt="Sampson's Barbershop"
              width={200}
              height={200}
              className="mx-auto h-28 md:h-36 w-auto object-contain mb-8"
              priority
            />
            <p className="section-kicker mb-2">Est. 2008 · Wheelersburg, Ohio</p>
            <span className="section-rule" aria-hidden="true" />
            <h1 className="font-serif text-4xl md:text-6xl text-[var(--text-primary)] mt-5 mb-3 tracking-tight">
              Sampson&apos;s Barbershop
            </h1>
            <p className="pull-quote text-xl md:text-2xl text-[var(--text-secondary)] mb-2">
              Traditional Cuts. Modern Style.
            </p>
            <p className="text-[var(--accent-red)] font-medium text-sm tracking-wide mb-4">Brian Sampson, Barber</p>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto mb-8 leading-relaxed">
              Quality haircuts and grooming services in Wheelersburg, Ohio. Family-friendly barbershop.{' '}
              <span className="text-[var(--accent-blue)] font-medium">Walk-ins only!</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <a href="#services" className="btn btn-primary">
                View Services
              </a>
              <a href="tel:740-357-8269" className="btn btn-secondary">
                <Phone size={15} aria-hidden />
                (740) 357-8269
              </a>
            </div>

            <p className="text-sm text-[var(--text-muted)] inline-flex items-center justify-center gap-1.5">
              <MapPin size={15} className="text-[var(--accent-red)] shrink-0" aria-hidden />
              8520 Ohio River Road, Wheelersburg, OH 45694
            </p>
          </div>

          <div className="border-t border-[var(--barber-border)]">
            <Image
              src="/exterior-color.jpg"
              alt="Sampson's Barber Shop exterior — brick building with blue roof, 8520 Ohio River Road, Wheelersburg"
              width={1536}
              height={1024}
              className="w-full h-auto block"
              sizes="100vw"
              priority
            />
          </div>

          <div className="border-t border-[var(--barber-border)] bg-[var(--barber-bg)]">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-[var(--text-secondary)] text-center md:text-left">
                <p>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle ${isOpen ? 'bg-[var(--accent-blue)]' : 'bg-[var(--accent-red)]'}`} />
                  {isOpen ? 'Open now' : 'Closed'}
                </p>
                <p className="md:text-center">Mon–Fri 9–5 · Sat 7–12 · Sun closed</p>
                <a
                  href="https://www.google.com/maps/place/Sampson's+Barber+Shop/@38.73,-82.84,15z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:text-right hover:text-[var(--accent-red)] transition-colors inline-flex items-center justify-center md:justify-end gap-1"
                >
                  <span className="flex" aria-hidden>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={13} className={i <= 4 ? 'fill-[#b8956a] text-[#b8956a]' : 'fill-[#e0d6c8] text-[#e0d6c8]'} />
                    ))}
                  </span>
                  4.5 · 95 reviews
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-16 md:py-20 border-b border-[var(--barber-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="Our Services"
              title="Quality Cuts at Honest Prices"
              description="Professional barbering services for the whole family. No hidden fees."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-4xl mx-auto divide-y md:divide-y-0 md:divide-x divide-[var(--barber-border)] border border-[var(--barber-border)] bg-[var(--barber-surface)] rounded-[4px]">
              {services.map((service) => (
                <div key={service.id} className="px-8 py-10 text-center">
                  <h3 className="font-serif text-xl text-[var(--text-primary)] mb-2">{service.name}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 min-h-[3.5rem]">{service.description}</p>
                  <p className="font-serif text-4xl text-[var(--accent-red)]">${service.price}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-[var(--text-muted)] text-sm mt-8">
              Walk-ins only · Good for kids · Cash &amp; cards accepted
            </p>
          </div>
        </section>

        <section id="gallery" className="py-16 md:py-20 border-b border-[var(--barber-border)] bg-[var(--barber-elevated)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="Style Guide"
              title="Classic Barbershop Styles"
              description="Browse our style guides for inspiration. Just point to what you like and we'll make it happen."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="vintage-frame">
                <Image src="/hairstyles-1.png" alt="Men's Clipper Cuts Guide" width={400} height={600} className="w-full h-auto" />
              </div>
              <div className="vintage-frame">
                <Image src="/hairstyles-2.png" alt="The Barber Hairstyle Guide" width={400} height={600} className="w-full h-auto" />
              </div>
              <div className="vintage-frame">
                <Image src="/hairstyles-3.png" alt="The Barber Hairstyle Guide" width={400} height={600} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="py-16 md:py-20 border-b border-[var(--barber-border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro kicker="Google Reviews" title="What Folks Are Saying" />

            <div className="surface p-8 md:p-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-[var(--text-muted)]">
                <Image src="/google-logo.svg" alt="" width={20} height={20} aria-hidden />
                Google Reviews
              </div>
              <p className="font-serif text-5xl text-[var(--text-primary)] mb-2">4.5</p>
              <div className="flex justify-center gap-0.5 mb-3" aria-label="4.5 out of 5 stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={20} className={i <= 4 ? 'fill-[#b8956a] text-[#b8956a]' : 'fill-[#e0d6c8] text-[#e0d6c8]'} />
                ))}
              </div>
              <p className="text-[var(--text-muted)] text-sm mb-8">Based on 95 reviews</p>
              <a
                href="https://www.google.com/search?q=Sampson's+Barber+Shop+Wheelersburg+Ohio+reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Read Reviews on Google
                <Navigation size={15} aria-hidden />
              </a>
            </div>

            <blockquote className="mt-10 text-center">
              <p className="pull-quote text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-4">
                &ldquo;Great place for a haircut. Friendly staff and always does a great job. Been going here for years!&rdquo;
              </p>
              <footer className="text-sm text-[var(--text-muted)]">— Happy Customer</footer>
            </blockquote>
          </div>
        </section>

        <section id="busy-times" className="py-12 md:py-20 border-b border-[var(--barber-border)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="Best Times to Visit"
              title="When It's Quiet"
              description="Plan your visit when it's less busy. Here's our typical weekly traffic pattern."
            />
            <BusyTimesChart />
          </div>
        </section>

        <section id="hours" className="py-16 md:py-20 border-b border-[var(--barber-border)] bg-[var(--barber-elevated)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="surface p-8">
                <p className="section-kicker">Business Hours</p>
                <span className="section-rule section-rule-left" aria-hidden="true" />
                <div className="flex items-baseline justify-between gap-4 mt-4 mb-6">
                  <h2 className="font-serif text-3xl text-[var(--text-primary)]">When We&apos;re Open</h2>
                  <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    {isOpen ? 'Open now' : 'Closed'}
                  </span>
                </div>

                <ul className="divide-y divide-[var(--barber-border)]">
                  {weeklyHours.map((hours) => (
                    <li key={hours.day_of_week} className="flex justify-between py-3 text-sm">
                      <span className="font-medium text-[var(--text-primary)]">{DAY_NAMES[hours.day_of_week]}</span>
                      <span className={hours.is_closed ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}>
                        {formatHoursForDay(hours)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="pull-quote text-sm text-[var(--text-muted)] mt-6 pt-4 border-t border-[var(--barber-border)]">
                  Walk-ins welcome — No appointment needed!
                </p>
              </div>

              <div id="location" className="surface p-8">
                <p className="section-kicker">Location</p>
                <span className="section-rule section-rule-left" aria-hidden="true" />
                <h2 className="font-serif text-3xl text-[var(--text-primary)] mt-4 mb-6">Find Us Here</h2>

                <div className="aspect-video overflow-hidden mb-6 border border-[var(--barber-border)] rounded-[4px]">
                  <iframe
                    src="https://maps.google.com/maps?q=Sampson's+Barber+Shop+8520+Ohio+River+Rd+Wheelersburg+OH+45694&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Sampson's Barbershop Location"
                  />
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-[var(--accent-red)] shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">8520 Ohio River Road</p>
                      <p className="text-[var(--text-muted)]">Wheelersburg, OH 45694</p>
                    </div>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=8520+Ohio+River+Road+Wheelersburg+OH+45694"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[var(--accent-blue)] hover:text-[var(--accent-red)]"
                      aria-label="Get directions"
                    >
                      <Navigation size={16} />
                    </a>
                  </div>
                  <a href="tel:740-357-8269" className="flex items-center gap-2 pt-3 border-t border-[var(--barber-border)] hover:text-[var(--accent-red)] transition-colors">
                    <Phone size={16} className="text-[var(--accent-blue)]" aria-hidden />
                    <span className="font-medium">(740) 357-8269</span>
                  </a>
                </div>
              </div>
            </div>

            {exceptions.length > 0 && (
              <div className="surface p-8 mt-8">
                <p className="section-kicker">Upcoming</p>
                <span className="section-rule section-rule-left" aria-hidden="true" />
                <h3 className="font-serif text-2xl text-[var(--text-primary)] mt-4 mb-6">Holiday / Special Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exceptions.map((exception) => (
                    <div key={exception.id} className="border-l-2 border-[var(--accent-tan)] pl-4">
                      <p className={`text-xs uppercase tracking-wider mb-1 ${exception.type === 'closed' ? 'text-[var(--accent-red)]' : 'text-[var(--accent-blue)]'}`}>
                        {exception.type === 'closed' ? 'Closed' : 'Modified hours'}
                      </p>
                      <p className="font-medium text-[var(--text-primary)]">{exception.label}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {new Date(exception.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {exception.type === 'modified' && exception.open_time && exception.close_time && (
                        <p className="text-sm text-[var(--accent-blue)] mt-1">
                          {formatTimeForDisplay(exception.open_time)} – {formatTimeForDisplay(exception.close_time)}
                        </p>
                      )}
                      {exception.notes && <p className="pull-quote text-xs text-[var(--text-muted)] mt-2">{exception.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-20 border-b border-[var(--barber-border)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <SectionIntro
              kicker="Walk-Ins Only"
              title="How to Get a Cut"
              description="No appointment needed! Just walk in during business hours and we'll take care of you."
            />

            <div className="surface p-8 text-left max-w-xl mx-auto mb-8">
              <h3 className="font-serif text-xl text-[var(--text-primary)] mb-1">Walk-Ins Welcome</h3>
              <p className="text-sm text-[var(--accent-blue)] mb-4">Monday – Saturday</p>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                At Sampson&apos;s Barbershop, we keep it simple. No apps, no booking systems — just stop by during our business hours and we&apos;ll get you taken care of. First come, first served.
              </p>
              <p className="text-sm text-[var(--text-muted)]">No appointments · First come, first served · Family friendly</p>
            </div>

            <div className="surface p-8 max-w-md mx-auto">
              <h3 className="font-serif text-xl text-[var(--text-primary)] mb-2">Ready for a Fresh Cut?</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Stop by during business hours. Brian Sampson is ready to give you a great haircut!
              </p>
              <a href="#hours" className="btn btn-primary w-full sm:w-auto">
                <Clock size={16} aria-hidden />
                View Hours
              </a>
              <div className="mt-8 pt-6 border-t border-[var(--barber-border)] grid grid-cols-3 gap-4 text-center">
                {services.slice(0, 3).map((service) => (
                  <div key={service.id}>
                    <p className="font-serif text-2xl text-[var(--accent-red)]">${service.price}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{service.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-sm text-[var(--text-muted)]">Serving Wheelersburg since 2008 · Brian Sampson, Barber</p>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--barber-surface)] border-t border-[var(--barber-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="" width={48} height={48} className="h-11 w-auto object-contain" />
                <span className="font-serif text-lg text-[var(--text-primary)]">Sampson&apos;s Barbershop</span>
              </div>
              <p className="text-sm text-[var(--accent-red)] font-medium mb-2">Brian Sampson, Barber</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
                Traditional cuts with modern style. Serving the Wheelersburg community with quality haircuts and grooming services. Walk-ins only!
              </p>
            </div>

            <div>
              <h4 className="section-kicker mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>
                  <a href="tel:740-357-8269" className="inline-flex items-center gap-2 hover:text-[var(--accent-red)]">
                    <Phone size={14} aria-hidden />
                    (740) 357-8269
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="shrink-0 mt-0.5" aria-hidden />
                  <span>
                    8520 Ohio River Road
                    <br />
                    Wheelersburg, OH 45694
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="section-kicker mb-3">Hours</h4>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                <li>Mon–Fri: 9 AM – 5 PM</li>
                <li>Saturday: 7 AM – 12 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[var(--barber-border)] flex flex-col sm:flex-row justify-between gap-3 text-xs text-[var(--text-muted)]">
            <p>&copy; {new Date().getFullYear()} Sampson&apos;s Barbershop. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Wheelersburg, Ohio</span>
              <a href="/admin" className="hover:text-[var(--text-secondary)]">
                Admin
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
