function About() {
  return (
    <div className="py-24 px-4 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">ABOUT</p>
          <h2 className="text-6xl md:text-7xl font-light tracking-tight mb-8">
            AKATSUKI SERIES
          </h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed max-w-4xl">
            <p>
              Akatsuki means <span className="text-akatsuki-red font-semibold">"Dawn"</span> — the rise of something unstoppable. 
              It represents a moment when creators, innovators, and dreamers decide to stop overthinking and start building.
            </p>
            <p>
              The Akatsuki Series is a high-intensity execution movement, built for students who want to break the cycle of endless ideas and no action. 
              It's not a course. It's not a bootcamp. It's a <span className="text-white font-semibold">7-day, skill-to-execution sprint</span> that transforms raw talent into real output.
            </p>
            <p>
              Every chapter pushes learners through a new frontier — design, communication, pitching, leadership, tech fundamentals, and rapid prototyping.
            </p>
            <p className="text-xl text-white font-semibold">
              This is where young innovators unlock their Dawn Moment.
            </p>
          </div>
        </div>

        {/* Mission and Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="border-l-2 border-akatsuki-red pl-8">
            <h3 className="text-3xl font-light mb-6">
              MISSION<span className="text-akatsuki-red">.</span>
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              To eliminate the execution gap by empowering young builders with the mindset, skills, and support system to turn ideas into real outcomes — fast.
            </p>
            <div className="space-y-2 text-gray-400">
              <p>• Practical, rapid skill activation</p>
              <p>• Community-driven momentum</p>
              <p>• Story-based learning that keeps users hooked</p>
              <p>• Systems that transform beginners into doers</p>
            </div>
          </div>

          {/* Vision */}
          <div className="border-l-2 border-akatsuki-red pl-8">
            <h3 className="text-3xl font-light mb-6">
              VISION<span className="text-akatsuki-red">.</span>
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              To build a global tribe of young founders and innovators who rise together — becoming the next wave of creators, leaders, and technologists shaping the future.
            </p>
            <div className="space-y-2 text-gray-400">
              <p>• The #1 execution platform for student innovators</p>
              <p>• A global youth movement for creators</p>
              <p>• A culture, not just a program</p>
              <p>• A pipeline that feeds talent into startups and ecosystems</p>
              <p>• A brand that inspires "Dawn Moments" everywhere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
