'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Phone, Menu, X } from 'lucide-react'

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#busy-times', label: 'Busy Times' },
  { href: '#hours', label: 'Hours' },
  { href: '#location', label: 'Location' },
]

export function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--barber-surface)] border-b border-[var(--barber-border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between min-h-[3.75rem] items-center gap-3">
          <a href="#" className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo.png"
              alt="Sampson's Barbershop"
              width={44}
              height={44}
              className="h-10 w-auto object-contain shrink-0"
              priority
            />
            <span className="font-serif text-base sm:text-lg text-[var(--text-primary)] truncate hidden min-[400px]:block">
              Sampson&apos;s
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-[var(--text-secondary)]">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[var(--accent-red)] transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href="tel:740-357-8269" className="btn btn-primary text-sm py-2.5 min-h-[44px]">
              <Phone size={15} aria-hidden />
              <span className="hidden sm:inline">Call Now</span>
              <span className="sm:hidden">Call</span>
            </a>
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-11 h-11 border border-[var(--barber-border)] rounded-[4px] text-[var(--text-primary)]"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-nav" className="md:hidden border-t border-[var(--barber-border)] py-3 pb-4">
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-3 px-1 text-[var(--text-primary)] text-base border-b border-[var(--barber-border)] last:border-0 active:text-[var(--accent-red)]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
