export default function CompetitiveEdge() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink text-bg">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />
      <div className="absolute -bottom-[20vh] -right-[15vh] w-[60vh] h-[60vh] rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-primary">
          07 &middot; Competitive Edge
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight text-bg">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[58vw]">
        <h2 className="font-display font-black text-[4.4vw] leading-[0.95] tracking-tight text-balance">
          LinkedIn is for offices.
          <span className="block text-primary">Iṣéyá is for the rest.</span>
        </h2>
        <p className="font-body text-[1.25vw] text-bg/70 mt-[2.4vh] leading-snug max-w-[54vw]">
          Generic job boards don&rsquo;t serve casual workers. Iṣéyá is purpose-built for
          how hiring actually happens in Nigeria.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-3 gap-[1.6vw]">
        <div className="bg-bg/5 ring-1 ring-bg/10 p-[1.8vw]">
          <p className="font-display font-black text-[1.6vw] text-primary">Local-first</p>
          <p className="font-body text-[1.05vw] text-bg/75 mt-[1vh] leading-snug">
            36 states, 774 LGAs, neighbourhood-level filters. Built for how
            Nigerians actually search for work.
          </p>
        </div>
        <div className="bg-bg/5 ring-1 ring-bg/10 p-[1.8vw]">
          <p className="font-display font-black text-[1.6vw] text-primary">Trust layer</p>
          <p className="font-body text-[1.05vw] text-bg/75 mt-[1vh] leading-snug">
            Verified ID, references and reviews replace the &ldquo;agbero&rdquo; agent
            with a system employers can audit.
          </p>
        </div>
        <div className="bg-bg/5 ring-1 ring-bg/10 p-[1.8vw]">
          <p className="font-display font-black text-[1.6vw] text-primary">Agent network</p>
          <p className="font-body text-[1.05vw] text-bg/75 mt-[1vh] leading-snug">
            Premium employers tap a vetted agent recommender &mdash; the only product
            that pays the informal middleman to go formal.
          </p>
        </div>
        <div className="bg-bg/5 ring-1 ring-bg/10 p-[1.8vw]">
          <p className="font-display font-black text-[1.6vw] text-primary">Mobile PWA</p>
          <p className="font-body text-[1.05vw] text-bg/75 mt-[1vh] leading-snug">
            Installable, low-data, works on entry-level Android &mdash; no Play Store
            review cycles or app-store fees.
          </p>
        </div>
        <div className="bg-bg/5 ring-1 ring-bg/10 p-[1.8vw]">
          <p className="font-display font-black text-[1.6vw] text-primary">Dual rails</p>
          <p className="font-body text-[1.05vw] text-bg/75 mt-[1vh] leading-snug">
            Paystack and Flutterwave both supported &mdash; redundant payment
            processing and broader bank coverage.
          </p>
        </div>
        <div className="bg-primary text-ink p-[1.8vw]">
          <p className="font-display font-black text-[1.6vw]">Built &amp; live</p>
          <p className="font-body text-[1.05vw] text-ink/80 mt-[1vh] leading-snug">
            Six-month engineering head start: admin dashboard, RBAC, verification
            and email infra are already production-grade.
          </p>
        </div>
      </div>
    </div>
  );
}
