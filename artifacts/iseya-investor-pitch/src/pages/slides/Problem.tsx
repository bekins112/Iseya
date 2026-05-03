export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          01 &middot; The Problem
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] max-w-[58vw]">
        <h2 className="font-display font-black text-[5vw] leading-[0.95] tracking-tight text-balance">
          Casual work in Nigeria is
          <span className="block text-accent">stuck offline.</span>
        </h2>
        <p className="font-body text-[1.5vw] text-muted mt-[3vh] max-w-[48vw] leading-snug text-balance">
          Millions of cleaners, drivers, nannies, security guards, plumbers and farm hands
          rely on word-of-mouth, WhatsApp groups and roadside &ldquo;agbero&rdquo; agents
          to find their next gig.
        </p>
      </div>

      <div className="absolute right-[6vw] top-[20vh] w-[30vw] flex flex-col gap-[2vh]">
        <div className="bg-cream p-[2.4vw] border-l-[0.4vw] border-primary">
          <p className="font-display font-black text-[3.6vw] leading-none text-text">80%+</p>
          <p className="font-body text-[1.15vw] text-muted mt-[1vh] leading-snug">
            of Nigeria&rsquo;s workforce is in the informal economy &mdash; with no
            consistent way to find or vet short-term work.
          </p>
        </div>
        <div className="bg-cream p-[2.4vw] border-l-[0.4vw] border-accent">
          <p className="font-display font-black text-[3.6vw] leading-none text-text">5&ndash;10x</p>
          <p className="font-body text-[1.15vw] text-muted mt-[1vh] leading-snug">
            time wasted per hire &mdash; employers screen unverified candidates
            through phone calls, referrals and dead-end leads.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[8vh] left-[6vw] right-[6vw] grid grid-cols-3 gap-[2vw]">
        <div>
          <p className="font-display font-bold text-[1.4vw] text-text">Workers can&rsquo;t be found</p>
          <p className="font-body text-[1.1vw] text-muted mt-[1vh] leading-snug">
            No professional profile. No verification. Income is unpredictable.
          </p>
        </div>
        <div>
          <p className="font-display font-bold text-[1.4vw] text-text">Employers can&rsquo;t trust</p>
          <p className="font-body text-[1.1vw] text-muted mt-[1vh] leading-snug">
            No background checks. No reviews. High risk of theft, no-shows and fraud.
          </p>
        </div>
        <div>
          <p className="font-display font-bold text-[1.4vw] text-text">Agents take the rent</p>
          <p className="font-body text-[1.1vw] text-muted mt-[1vh] leading-snug">
            Informal middlemen charge 1&ndash;2 months of wages, with no recourse.
          </p>
        </div>
      </div>
    </div>
  );
}
