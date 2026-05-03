export default function TheAsk() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />
      <div className="absolute top-0 right-0 h-full w-[42vw] bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          10 &middot; The Ask
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight text-ink">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] max-w-[48vw]">
        <p className="font-body text-[1.1vw] uppercase tracking-[0.4em] text-accent">Seed Round</p>
        <h2 className="font-display font-black text-[6vw] leading-[0.92] tracking-tight mt-[2vh]">
          Raising
          <span className="block text-accent">[$XXX,000]</span>
        </h2>
        <p className="font-body text-[1.4vw] text-muted mt-[2.4vh] leading-snug max-w-[42vw]">
          Equivalent to roughly &#8358;[XXX] million &mdash; an 18-month runway to reach
          three Nigerian cities, 10,000 verified workers and break-even unit economics.
        </p>
        <p className="font-body text-[0.95vw] uppercase tracking-[0.35em] text-muted mt-[3vh]">
          [Replace amount and currency with the figure you&rsquo;re raising]
        </p>
      </div>

      <div className="absolute right-[6vw] top-[18vh] bottom-[8vh] w-[30vw] flex flex-col justify-between">
        <div>
          <p className="font-display font-bold text-[1.6vw] text-ink mb-[2vh]">Use of funds</p>

          <div className="flex items-center justify-between border-b border-ink/15 py-[1.4vh]">
            <span className="font-body text-[1.2vw] text-ink">Engineering &amp; product</span>
            <span className="font-display font-black text-[2vw] text-ink">40%</span>
          </div>
          <div className="flex items-center justify-between border-b border-ink/15 py-[1.4vh]">
            <span className="font-body text-[1.2vw] text-ink">Growth &amp; marketing</span>
            <span className="font-display font-black text-[2vw] text-ink">30%</span>
          </div>
          <div className="flex items-center justify-between border-b border-ink/15 py-[1.4vh]">
            <span className="font-body text-[1.2vw] text-ink">Operations &amp; agents</span>
            <span className="font-display font-black text-[2vw] text-ink">20%</span>
          </div>
          <div className="flex items-center justify-between py-[1.4vh]">
            <span className="font-body text-[1.2vw] text-ink">Runway buffer</span>
            <span className="font-display font-black text-[2vw] text-ink">10%</span>
          </div>
        </div>

        <div>
          <p className="font-body text-[1vw] text-ink/70 uppercase tracking-[0.3em]">Milestones, 18 months</p>
          <p className="font-body text-[1.15vw] text-ink mt-[1vh] leading-snug">
            3 cities &middot; 10k verified workers &middot; 1k paying employers &middot; positive contribution margin.
          </p>
        </div>
      </div>
    </div>
  );
}
