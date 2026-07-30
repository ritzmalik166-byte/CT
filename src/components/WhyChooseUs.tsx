import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function IdeaShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#0B0B0D] py-20">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-6 lg:flex-row">
        {/* Left Side */}
        <div className="flex w-full items-end justify-center lg:w-[35%]">
          <div className="relative">
            <Image
              src="/images/character.png"
              alt="Character"
              width={300}
              height={450}
              className="h-auto w-[230px] object-contain lg:w-[280px]"
            />

            <button className="absolute left-[65%] top-10 flex items-center gap-2 rounded-full border border-yellow-500/40 bg-[#171717] px-6 py-3 text-sm text-white transition hover:border-yellow-400 hover:bg-[#1d1d1d]">
              Explore Our Work
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[60%]">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#6F89AE] to-[#2D3E5A] p-8 shadow-2xl">
            <h2 className="max-w-md text-3xl font-light uppercase leading-tight tracking-wide text-white">
              Transforming Ideas Into
              <br />
              Digital Experiences
            </h2>

            <Image
              src="/images/mobile-showcase.png"
              alt="Showcase"
              width={700}
              height={500}
              className="mx-auto mt-6 h-auto w-full max-w-lg object-contain"
            />
          </div>
        </div>
      </div>

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-1/2 h-24 w-[110%] -translate-x-1/2 rounded-t-[100px] bg-[#121214]" />
    </section>
  );
}