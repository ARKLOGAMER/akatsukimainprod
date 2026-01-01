import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"

const testimonials = [
  {
    author: {
      name: "Asiya S",
      handle: "Chapter 1 Cohort",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Asiya&backgroundColor=ffd5dc"
    },
    text: "My Akatsuki Chapter 1 journey was insightful and skill-building, especially the hands-on UI/UX and blockchain classes. The sessions were interactive and very beginner-friendly. I gained practical skills, clearer understanding of tools, and the confidence to start building real projects. Thanks all ❤"
  },
  {
    author: {
      name: "Akshay A",
      handle: "Chapter 1 Cohort",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Akshay&backgroundColor=b6e3f4"
    },
    text: "I successfully gained new skills and developed working prototypes. This experience was the crucial first step in my long-term career development."
  },
  {
    author: {
      name: "Aswan Ayyappan",
      handle: "Chapter 1 Cohort",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aswan&backgroundColor=c0aede"
    },
    text: "I learned new skills and created working prototypes. For me, this chapter was the first step in my career development."
  }
]

export default function Testimonials() {
  return (
    <TestimonialsSection
      title="Trusted by innovators across India"
      description="Join hundreds of students who have transformed their ideas into reality through Akatsuki's execution sprints"
      testimonials={testimonials}
    />
  )
}
