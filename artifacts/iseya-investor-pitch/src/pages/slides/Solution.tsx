const base = import.meta.env.BASE_URL;

export default function Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 right-0 h-full w-[44vw] bg-ink" />
      <div className="absolute top-0 right-[44vw] h-full w-[8vw] bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          02 &middot; The Solution
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight text-bg">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[20vh] max-w-[40vw]">
        <h2 className="font-display font-black text-[4.6vw] leading-[0.95] tracking-tight text-balance">
          A mobile-first
          <span className="block text-accent">marketplace</span>
          for Nigerian work.
        </h2>
        <p className="font-body text-[1.4vw] text-muted mt-[3vh] leading-snug text-balance">
          Iṣéyá is a Progressive Web App that lets workers browse local jobs, apply
          in seconds, and build a verified profile &mdash; while employers post roles,
          screen verified candidates, and hire the same day.
        </p>
        <div className="mt-[4vh] flex flex-col gap-[1.4vh]">
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="font-display font-black text-[1.6vw] text-primary">01</span>
            <span className="font-body text-[1.3vw] text-text">Sign up by role &mdash; Worker, Employer or Agent.</span>
          </div>
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="font-display font-black text-[1.6vw] text-primary">02</span>
            <span className="font-body text-[1.3vw] text-text">Get verified with ID, photo and references.</span>
          </div>
          <div className="flex items-baseline gap-[1.2vw]">
            <span className="font-display font-black text-[1.6vw] text-primary">03</span>
            <span className="font-body text-[1.3vw] text-text">Match, message and hire &mdash; entirely on a phone.</span>
          </div>
        </div>
      </div>

      <div className="absolute right-[6vw] top-[16vh] w-[36vw] h-[68vh] flex items-center justify-center">
        <img
          src={`${base}img/mobile-browse.png`}
          crossOrigin="anonymous"
          alt="Browse jobs on mobile"
          className="h-full w-auto rounded-[1.2vw] shadow-2xl ring-1 ring-bg/10"
        />
      </div>
    </div>
  );
}
