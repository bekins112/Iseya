export default function Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          04 &middot; Market Opportunity
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] max-w-[42vw]">
        <h2 className="font-display font-black text-[4.6vw] leading-[0.95] tracking-tight text-balance">
          Africa&rsquo;s largest
          <span className="block text-accent">informal labour market</span>
          is going online.
        </h2>
        <p className="font-body text-[1.25vw] text-muted mt-[3vh] leading-snug max-w-[36vw]">
          Nigeria has 220M+ people, a median age of 18, and the largest mobile internet
          base on the continent. The rails for digital hiring &mdash; smartphones,
          mobile money, KYC &mdash; are finally in place.
        </p>
      </div>

      <div className="absolute right-[6vw] top-[16vh] bottom-[8vh] w-[42vw] grid grid-cols-2 grid-rows-2 gap-[1.6vw]">
        <div className="bg-ink text-bg p-[2vw] flex flex-col justify-between">
          <p className="font-body text-[1vw] uppercase tracking-[0.3em] text-primary">Population</p>
          <p className="font-display font-black text-[5vw] leading-none">220M</p>
          <p className="font-body text-[1.05vw] text-bg/70 leading-snug">
            Nigerians, half under 19, mostly urbanising.
          </p>
        </div>
        <div className="bg-primary text-ink p-[2vw] flex flex-col justify-between">
          <p className="font-body text-[1vw] uppercase tracking-[0.3em] text-ink/70">Informal Workforce</p>
          <p className="font-display font-black text-[5vw] leading-none">80%</p>
          <p className="font-body text-[1.05vw] text-ink/80 leading-snug">
            of jobs are off-the-books, casual or self-employed.
          </p>
        </div>
        <div className="bg-cream p-[2vw] flex flex-col justify-between ring-1 ring-text/5">
          <p className="font-body text-[1vw] uppercase tracking-[0.3em] text-muted">Mobile Internet</p>
          <p className="font-display font-black text-[5vw] leading-none text-text">120M+</p>
          <p className="font-body text-[1.05vw] text-muted leading-snug">
            connections &mdash; the addressable PWA audience today.
          </p>
        </div>
        <div className="bg-cream p-[2vw] flex flex-col justify-between ring-1 ring-text/5">
          <p className="font-body text-[1vw] uppercase tracking-[0.3em] text-muted">Fintech Rails</p>
          <p className="font-display font-black text-[5vw] leading-none text-text">2 of 2</p>
          <p className="font-body text-[1.05vw] text-muted leading-snug">
            Paystack &amp; Flutterwave already integrated for NGN payments.
          </p>
        </div>
      </div>
    </div>
  );
}
