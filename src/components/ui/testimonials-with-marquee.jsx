import { cn } from "@/lib/utils"
import { TestimonialCard } from "@/components/ui/testimonial-card"

export function TestimonialsSection({ title, description, testimonials, className }) {
  return (
    <section
      className={cn(
        "bg-black text-white",
        "py-12 sm:py-24 md:py-32 px-0",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-gray-400 sm:text-xl">
            {description}
          </p>
        </div>
        
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:60s]">
            {/* First set - animates */}
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`set1-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Second set - animates (creates seamless loop) */}
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`set2-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Third set - animates (ensures no gaps) */}
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`set3-${i}`} {...testimonial} />
              ))}
            </div>
          </div>
          
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-black sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-black sm:block" />
        </div>
      </div>
    </section>
  )
}
