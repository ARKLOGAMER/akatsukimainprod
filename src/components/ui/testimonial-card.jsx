import { cn } from "@/lib/utils"

export function TestimonialCard({ author, text, href, className }) {
  const Card = href ? 'a' : 'div'
  
  // Check if avatar is an emoji (single character or emoji)
  const isEmoji = author.avatar && author.avatar.length <= 4 && !author.avatar.startsWith('http')
  
  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-lg border border-gray-800",
        "bg-gradient-to-b from-gray-900/50 to-gray-900/10",
        "p-4 text-start sm:p-6",
        "hover:from-gray-900/60 hover:to-gray-900/20",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isEmoji ? (
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
            {author.avatar}
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full overflow-hidden">
            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-white">
            {author.name}
          </h3>
          <p className="text-sm text-gray-400">{author.handle}</p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-gray-300">{text}</p>
    </Card>
  )
}
