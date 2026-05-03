export default function Team() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          09 &middot; Team
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[60vw]">
        <h2 className="font-display font-black text-[4.4vw] leading-[0.95] tracking-tight">
          Operators who&rsquo;ve
          <span className="text-accent"> shipped product.</span>
        </h2>
        <p className="font-body text-[1.2vw] text-muted mt-[2vh] max-w-[58vw] leading-snug">
          A small, technical founding team. The platform you saw on the previous slides
          is what we built before raising a single naira.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[14vh] grid grid-cols-3 gap-[2vw]">
        <div className="bg-cream p-[2vw] ring-1 ring-text/5">
          <div className="w-[5vw] h-[5vw] rounded-full bg-primary flex items-center justify-center font-display font-black text-[2vw] text-ink">
            FN
          </div>
          <p className="font-display font-bold text-[1.5vw] mt-[2vh]">[Founder Name]</p>
          <p className="font-body text-[1.1vw] text-accent uppercase tracking-[0.2em] mt-[0.4vh]">
            Founder &amp; CEO
          </p>
          <p className="font-body text-[1.05vw] text-muted mt-[1.4vh] leading-snug">
            Vision, product and partnerships. Lagos-based operator with deep
            domain experience in Nigerian hiring.
          </p>
        </div>
        <div className="bg-cream p-[2vw] ring-1 ring-text/5">
          <div className="w-[5vw] h-[5vw] rounded-full bg-ink flex items-center justify-center font-display font-black text-[2vw] text-primary">
            HE
          </div>
          <p className="font-display font-bold text-[1.5vw] mt-[2vh]">[Engineering Lead]</p>
          <p className="font-body text-[1.1vw] text-accent uppercase tracking-[0.2em] mt-[0.4vh]">
            Head of Engineering
          </p>
          <p className="font-body text-[1.05vw] text-muted mt-[1.4vh] leading-snug">
            Owns platform reliability, payments and the verification stack.
            Full-stack TypeScript, Postgres and Express.
          </p>
        </div>
        <div className="bg-cream p-[2vw] ring-1 ring-text/5">
          <div className="w-[5vw] h-[5vw] rounded-full bg-accent flex items-center justify-center font-display font-black text-[2vw] text-ink">
            HG
          </div>
          <p className="font-display font-bold text-[1.5vw] mt-[2vh]">[Growth Lead]</p>
          <p className="font-body text-[1.1vw] text-accent uppercase tracking-[0.2em] mt-[0.4vh]">
            Head of Growth
          </p>
          <p className="font-body text-[1.05vw] text-muted mt-[1.4vh] leading-snug">
            Agent network, employer partnerships and city-level GTM execution.
            Prior marketplace and SMB sales experience.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] text-center">
        <p className="font-body text-[1vw] text-muted uppercase tracking-[0.35em]">
          [Replace bracketed names and bios with real team details before sending]
        </p>
      </div>
    </div>
  );
}
