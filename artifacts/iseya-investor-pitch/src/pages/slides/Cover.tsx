const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink text-bg">
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute -top-[20vh] -right-[20vh] w-[80vh] h-[80vh] rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-[15vh] -left-[10vh] w-[60vh] h-[60vh] rounded-full bg-accent/20 blur-3xl" />

      <div className="absolute top-[6vh] left-[6vw] flex items-center">
        <img
          src={`${base}img/iseya-logo.png`}
          crossOrigin="anonymous"
          alt="Iṣéyá"
          className="h-[8vh] w-auto"
        />
      </div>

      <div className="absolute top-[6vh] right-[6vw] text-right">
        <p className="font-body text-[1.1vw] text-bg/60 uppercase tracking-[0.3em]">Investor Pitch</p>
        <p className="font-body text-[1.1vw] text-bg/60 mt-[0.6vh]">2026 · Lagos, Nigeria</p>
      </div>

      <div className="absolute left-[6vw] top-[42vh] max-w-[70vw]">
        <p className="font-body text-[1.3vw] text-primary uppercase tracking-[0.4em] mb-[2vh]">
          Nigeria&rsquo;s Casual Work Marketplace
        </p>
        <h1 className="font-display font-black text-[8vw] leading-[0.92] tracking-tighter text-bg text-balance">
          Work, found
          <span className="block text-primary">in minutes.</span>
        </h1>
        <p className="font-body text-[1.6vw] text-bg/75 mt-[3vh] max-w-[55vw] text-balance leading-snug">
          A mobile-first marketplace matching verified Nigerian workers with employers
          who need help today &mdash; not next week.
        </p>
      </div>

      <div className="absolute bottom-[6vh] left-[6vw] right-[6vw] flex items-end justify-between">
        <div className="flex items-center gap-[2vw]">
          <span className="h-[1px] w-[6vw] bg-primary" />
          <span className="font-body text-[1.1vw] text-bg/70 uppercase tracking-[0.3em]">
            Seed Round &middot; Confidential
          </span>
        </div>
        <p className="font-body text-[1.1vw] text-bg/60">iseya.ng</p>
      </div>
    </div>
  );
}
