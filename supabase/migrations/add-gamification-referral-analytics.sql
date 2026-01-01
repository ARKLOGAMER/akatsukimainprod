-- ============================================
-- GAMIFICATION, REFERRAL & ANALYTICS SYSTEM
-- ============================================

-- 1. STUDENT PROFILES (Enhanced)
ALTER TABLE students ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE students ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS year_of_study INTEGER;

-- 2. POINTS SYSTEM
CREATE TABLE IF NOT EXISTS student_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. BADGES/ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INTEGER DEFAULT 0,
  type VARCHAR(50), -- 'attendance', 'referral', 'completion', 'special'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- 4. REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES students(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES students(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  reward_points INTEGER DEFAULT 0,
  reward_promo_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 5. BOOKMARKS
CREATE TABLE IF NOT EXISTS event_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, event_id)
);

-- 6. ANALYTICS - PAGE VIEWS
CREATE TABLE IF NOT EXISTS event_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. ANALYTICS - CONVERSION FUNNEL
CREATE TABLE IF NOT EXISTS conversion_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  stage VARCHAR(50) NOT NULL, -- 'view', 'click_register', 'form_fill', 'payment_initiated', 'payment_completed'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. SEO METADATA
CREATE TABLE IF NOT EXISTS event_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  meta_title VARCHAR(200),
  meta_description TEXT,
  meta_keywords TEXT,
  og_image TEXT,
  og_title VARCHAR(200),
  og_description TEXT,
  twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
  schema_markup JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'AKT' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON students
FOR EACH ROW
EXECUTE FUNCTION generate_referral_code();

-- Function: Award points
CREATE OR REPLACE FUNCTION award_points(
  p_student_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_event_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Add points record
  INSERT INTO student_points (student_id, points, reason, event_id)
  VALUES (p_student_id, p_points, p_reason, p_event_id);
  
  -- Update total points
  UPDATE students
  SET total_points = total_points + p_points,
      level = FLOOR((total_points + p_points) / 100) + 1
  WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Track conversion
CREATE OR REPLACE FUNCTION track_conversion(
  p_event_id UUID,
  p_student_id UUID,
  p_stage VARCHAR(50),
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO conversion_tracking (event_id, student_id, stage, metadata)
  VALUES (p_event_id, p_student_id, p_stage, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DEFAULT BADGES
-- ============================================

INSERT INTO badges (name, description, icon, points_required, type) VALUES
('First Step', 'Registered for your first event', '🎯', 0, 'attendance'),
('Event Enthusiast', 'Attended 5 events', '🔥', 500, 'attendance'),
('Event Master', 'Attended 10 events', '👑', 1000, 'attendance'),
('Referral Rookie', 'Referred 1 friend', '🤝', 100, 'referral'),
('Referral Pro', 'Referred 5 friends', '💪', 500, 'referral'),
('Referral Legend', 'Referred 10 friends', '🌟', 1000, 'referral'),
('Profile Complete', 'Completed your profile 100%', '✅', 50, 'completion'),
('Early Bird', 'Registered during early bird period', '🐦', 50, 'special'),
('Certificate Collector', 'Earned 5 certificates', '📜', 500, 'completion');

-- ============================================
-- RLS POLICIES
-- ============================================

-- Student Points
ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own points"
ON student_points FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage points"
ON student_points FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
ON badges FOR SELECT
USING (true);

-- Student Badges
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own badges"
ON student_badges FOR SELECT
USING (auth.uid() = student_id);

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Bookmarks
ALTER TABLE event_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own bookmarks"
ON event_bookmarks FOR ALL
USING (auth.uid() = student_id);

-- Event Views (Public read for analytics)
ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create views"
ON event_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
ON event_views FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Conversion Tracking
ALTER TABLE conversion_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track conversions"
ON conversion_tracking FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view conversions"
ON conversion_tracking FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- SEO Metadata
ALTER TABLE event_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEO data"
ON event_seo FOR SELECT
USING (true);

CREATE POLICY "Admins can manage SEO"
ON event_seo FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_student_points_student ON student_points(student_id);
CREATE INDEX idx_student_points_created ON student_points(created_at DESC);
CREATE INDEX idx_student_badges_student ON student_badges(student_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_bookmarks_student ON event_bookmarks(student_id);
CREATE INDEX idx_event_views_event ON event_views(event_id);
CREATE INDEX idx_event_views_created ON event_views(created_at DESC);
CREATE INDEX idx_conversion_event ON conversion_tracking(event_id);
CREATE INDEX idx_conversion_stage ON conversion_tracking(stage);
CREATE INDEX idx_conversion_created ON conversion_tracking(created_at DESC);

COMMENT ON TABLE student_points IS 'Tracks all point transactions for gamification';
COMMENT ON TABLE badges IS 'Available badges/achievements in the system';
COMMENT ON TABLE student_badges IS 'Badges earned by students';
COMMENT ON TABLE referrals IS 'Student referral tracking and rewards';
COMMENT ON TABLE event_bookmarks IS 'Events bookmarked by students';
COMMENT ON TABLE event_views IS 'Page view analytics for events';
COMMENT ON TABLE conversion_tracking IS 'Conversion funnel tracking';
COMMENT ON TABLE event_seo IS 'SEO metadata for events';
