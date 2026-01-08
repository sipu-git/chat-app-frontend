'use client'

interface AnimatedButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export default function AnimatedButton({
  text,
  onClick,
  className = "",
}: AnimatedButtonProps) {
  return (
    <button
      onClick={onClick}
     style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6, 182, 212, 0.25), transparent 70%), #000000",
      }}
      className={`cursor-pointer 
    px-12 py-3 rounded-[30px] border-none outline-none
      text-white font-medium group ${className}`}
    >
      <div className="relative overflow-hidden h-7">
        <p
          className="group-hover:-translate-y-7 transition-transform
          duration-[1125ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
        >
          {text}
        </p>
        <p
          className="absolute top-7 left-0 group-hover:top-0
          transition-all duration-[1125ms]
          ease-[cubic-bezier(0.19,1,0.22,1)]"
        >
          {text}
        </p>
      </div>
    </button>
  );
}
