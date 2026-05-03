export default function BusinessModel() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          05 &middot; Business Model
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[58vw]">
        <h2 className="font-display font-black text-[4.4vw] leading-[0.95] tracking-tight">
          Tiered subscriptions,
          <span className="text-accent"> Naira-native.</span>
        </h2>
        <p className="font-body text-[1.2vw] text-muted mt-[2vh] max-w-[60vw] leading-snug">
          Employers pay monthly to post jobs and access verified workers. Add-on
          credits drive expansion revenue. Payments process through Paystack and
          Flutterwave &mdash; no FX friction for SMEs.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[12vh] grid grid-cols-4 gap-[1.4vw]">
        <div className="bg-cream p-[1.6vw] ring-1 ring-text/5 flex flex-col">
          <p className="font-body text-[0.9vw] uppercase tracking-[0.25em] text-muted">Free</p>
          <p className="font-display font-black text-[2.6vw] mt-[0.6vh] leading-none">&#8358;0</p>
          <p className="font-body text-[1vw] text-muted mt-[1.2vh] leading-snug">
            Browse, profile, 1 active job. Onboards every employer.
          </p>
        </div>
        <div className="bg-cream p-[1.6vw] ring-1 ring-text/5 flex flex-col">
          <p className="font-body text-[0.9vw] uppercase tracking-[0.25em] text-muted">Standard</p>
          <p className="font-display font-black text-[2.6vw] mt-[0.6vh] leading-none">&#8358;5k</p>
          <p className="font-body text-[1vw] text-muted mt-[1.2vh] leading-snug">
            5 jobs, applicant inbox, basic verification badges.
          </p>
        </div>
        <div className="bg-primary text-ink p-[1.6vw] flex flex-col relative">
          <span className="absolute -top-[1.4vh] right-[1.2vw] bg-ink text-primary text-[0.85vw] px-[0.8vw] py-[0.4vh] font-body font-semibold uppercase tracking-[0.2em]">
            Popular
          </span>
          <p className="font-body text-[0.9vw] uppercase tracking-[0.25em] text-ink/70">Premium</p>
          <p className="font-display font-black text-[2.6vw] mt-[0.6vh] leading-none">&#8358;15k</p>
          <p className="font-body text-[1vw] text-ink/80 mt-[1.2vh] leading-snug">
            Unlimited jobs, agent recommender, Facebook auto-posting.
          </p>
        </div>
        <div className="bg-ink text-bg p-[1.6vw] flex flex-col">
          <p className="font-body text-[0.9vw] uppercase tracking-[0.25em] text-primary">Enterprise</p>
          <p className="font-display font-black text-[2.6vw] mt-[0.6vh] leading-none">Custom</p>
          <p className="font-body text-[1vw] text-bg/75 mt-[1.2vh] leading-snug">
            Hiring companies, bulk credits, API and dedicated account team.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] flex items-center gap-[2vw]">
        <span className="h-[1px] flex-1 bg-text/15" />
        <p className="font-body text-[1vw] text-muted uppercase tracking-[0.3em]">
          Add-ons &middot; Interview credits &middot; Agent credit packs &middot; Featured listings
        </p>
        <span className="h-[1px] flex-1 bg-text/15" />
      </div>
    </div>
  );
}
