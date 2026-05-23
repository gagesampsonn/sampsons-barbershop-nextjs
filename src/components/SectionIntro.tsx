type SectionIntroProps = {
  kicker: string
  title: string
  description?: string
  align?: 'center' | 'left'
}

export function SectionIntro({ kicker, title, description, align = 'center' }: SectionIntroProps) {
  const centered = align === 'center'

  return (
    <div className={centered ? 'text-center max-w-2xl mx-auto mb-12' : 'mb-10'}>
      <p className={`section-kicker ${centered ? '' : 'text-left'}`}>{kicker}</p>
      <span className={`section-rule ${centered ? '' : 'section-rule-left'}`} aria-hidden="true" />
      <h2 className={`font-serif text-3xl md:text-4xl text-[var(--text-primary)] mt-4 ${centered ? '' : 'text-left'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-[var(--text-secondary)] leading-relaxed ${centered ? '' : 'text-left'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
