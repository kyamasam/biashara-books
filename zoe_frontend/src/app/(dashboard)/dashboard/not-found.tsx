"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen  flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* Dot-grid background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.45,
        }}
      />

      {/* Orbit ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary opacity-50"
        style={{
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          transform: "translate(-50%, -50%) rotate(-20deg)",
        }}
      />

      {/* Satellite SVG */}
      <div className="relative z-10 mb-10">
        <svg
          width="320"
          height="220"
          viewBox="0 0 320 220"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Lost satellite illustration"
        >
          <style>{`
            @keyframes drift {
              from { transform: translate(0,0) rotate(0deg); }
              to   { transform: translate(18px,-12px) rotate(6deg); }
            }
            @keyframes signal { 0%,100%{opacity:0} 50%{opacity:1} }
            @keyframes blink  { 0%,90%,100%{opacity:1} 95%{opacity:0.2} }
            .sat   { animation: drift 4s ease-in-out infinite alternate; transform-origin: 160px 110px; }
            .sig1  { animation: signal 2.2s ease-in-out infinite; }
            .sig2  { animation: signal 2.2s ease-in-out infinite .5s; }
            .sig3  { animation: signal 2.2s ease-in-out infinite 1s; }
            .blink { animation: blink 3.5s ease-in-out infinite; }
          `}</style>

          {/* Signal arcs */}
          <g
            className="sig3"
            fill="none"
            stroke="#F4C300"
            strokeWidth="1.2"
            opacity="0.25"
          >
            <path d="M 90 60 Q 40 110 90 160" strokeDasharray="4 4" />
          </g>
          <g
            className="sig2"
            fill="none"
            stroke="#F4C300"
            strokeWidth="1.2"
            opacity="0.4"
          >
            <path d="M 100 70 Q 65 110 100 150" strokeDasharray="4 4" />
          </g>
          <g
            className="sig1"
            fill="none"
            stroke="#F4C300"
            strokeWidth="1.5"
            opacity="0.6"
          >
            <path d="M 110 80 Q 88 110 110 140" strokeDasharray="4 4" />
          </g>

          {/* Satellite body group */}
          <g className="sat">
            {/* Left solar panel */}
            <rect
              x="122"
              y="96"
              width="18"
              height="28"
              rx="3"
              fill="#F4C300"
              fillOpacity="0.2"
              stroke="#F4C300"
              strokeWidth="1"
              opacity="0.85"
            />
            <line
              x1="122"
              y1="103"
              x2="140"
              y2="103"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="122"
              y1="110"
              x2="140"
              y2="110"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="122"
              y1="117"
              x2="140"
              y2="117"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            {/* Connector arm left */}
            <rect
              x="138"
              y="107"
              width="10"
              height="6"
              rx="1"
              fill="#F4C300"
              fillOpacity="0.4"
            />
            {/* Main body */}
            <rect
              x="148"
              y="88"
              width="44"
              height="44"
              rx="8"
              fill="hsl(var(--card))"
              stroke="#F4C300"
              strokeWidth="1.5"
            />
            {/* Body panel lines */}
            <line
              x1="148"
              y1="104"
              x2="192"
              y2="104"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
            <line
              x1="148"
              y1="116"
              x2="192"
              y2="116"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
            <line
              x1="168"
              y1="88"
              x2="168"
              y2="132"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
            {/* Indicator blink */}
            <circle
              className="blink"
              cx="180"
              cy="96"
              r="3"
              fill="#22c55e"
              opacity="0.9"
            />
            {/* Connector arm right */}
            <rect
              x="192"
              y="107"
              width="10"
              height="6"
              rx="1"
              fill="#F4C300"
              fillOpacity="0.4"
            />
            {/* Right solar panel */}
            <rect
              x="200"
              y="96"
              width="18"
              height="28"
              rx="3"
              fill="#F4C300"
              fillOpacity="0.2"
              stroke="#F4C300"
              strokeWidth="1"
              opacity="0.85"
            />
            <line
              x1="200"
              y1="103"
              x2="218"
              y2="103"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="200"
              y1="110"
              x2="218"
              y2="110"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="200"
              y1="117"
              x2="218"
              y2="117"
              stroke="#F4C300"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            {/* Dish arm */}
            <line
              x1="170"
              y1="88"
              x2="162"
              y2="72"
              stroke="#F4C300"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Dish bowl */}
            <path
              d="M152 68 Q162 56 172 68"
              fill="none"
              stroke="#F4C300"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M154 68 Q162 61 170 68"
              fill="#F4C300"
              fillOpacity="0.15"
              stroke="none"
            />
          </g>

          {/* Broken signal × */}
          <g opacity="0.8">
            <line
              x1="76"
              y1="96"
              x2="88"
              y2="108"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="88"
              y1="96"
              x2="76"
              y2="108"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Stars */}
          <circle cx="44" cy="32" r="1.2" fill="#F4C300" opacity="0.5" />
          <circle cx="270" cy="18" r="1.5" fill="#F4C300" opacity="0.4" />
          <circle cx="295" cy="55" r="1" fill="#F4C300" opacity="0.35" />
          <circle cx="30" cy="175" r="1.2" fill="#F4C300" opacity="0.4" />
          <circle cx="285" cy="170" r="1.8" fill="#F4C300" opacity="0.35" />
          <circle cx="58" cy="52" r="1" fill="#F4C300" opacity="0.3" />
          <circle cx="250" cy="140" r="1" fill="#F4C300" opacity="0.35" />
        </svg>
      </div>

      {/* 404 numeral */}
      <div
        className="relative z-10 font-bold leading-none text-primary mb-2 motion-safe:animate-bounce motion-lofi sepia-50"
        style={{ fontSize: "clamp(72px, 14vw, 108px)", letterSpacing: "-4px" }}
      >
        4<span style={{ color: "#F4C300" }}>0</span>4
      </div>

      {/* Badge */}
      <div
        className="relative z-10 inline-flex items-center gap-2 mb-5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase"
        style={{ background: "rgba(249,115,22,0.12)", color: "#F4C300" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#F4C300" }}
        />
        Signal lost
      </div>

      {/* Heading & description */}
      <h1 className="relative z-10 text-xl font-bold text-gray-500 text-center mb-2 leading-snug max-w-xs">
        We lost the page somewhere in orbit.
      </h1>

      {/* CTA row */}
      <div className="relative z-10 flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 h-10 px-5 rounded-full
                     border-[1.5px] border-border bg-transparent
                     text-sm font-medium text-foreground cursor-pointer
                     hover:border-yellow-500 transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          Go back
        </button>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 h-10 px-5 rounded-full
                     text-sm font-bold text-white
                     hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          style={{ background: "#F4C300" }}
        >
          <Home size={14} />
          Take me home
        </Link>
      </div>
    </div>
  );
}
