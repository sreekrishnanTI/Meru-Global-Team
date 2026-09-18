import bcrypt from "bcryptjs";
import { query, pool, ensureDatabaseExists } from "./pool.js";

export async function runMigrations() {
  console.log("--> Ensuring PostgreSQL database exists...");
  await ensureDatabaseExists();

  console.log("--> Running PostgreSQL schema migrations...");

  // Enable pgcrypto for UUIDs if not available
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // 1. Admins table
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      must_change_password BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Homepage settings
  await query(`
    CREATE TABLE IF NOT EXISTS homepage_settings (
      id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
      hero_title TEXT NOT NULL DEFAULT 'Reaching the Unreached',
      hero_subtitle TEXT NOT NULL DEFAULT 'Connecting generations to the Great Commission',
      hero_image_path TEXT DEFAULT '',
      hero_video_url TEXT DEFAULT '',
      logo_rotation BOOLEAN DEFAULT true,
      about_title TEXT DEFAULT 'Reaching the Unreached, Connecting generations to the great commission.',
      about_subtitle TEXT DEFAULT 'ABOUT US',
      about_overview TEXT DEFAULT 'Through our dedicated programs and global network, we bridge geographical and cultural gaps to bring hope and community transformation.',
      about_mission_title TEXT DEFAULT 'Our Mission',
      about_mission_text TEXT DEFAULT 'To mobilize, equip, and commission youth and professionals across nations.',
      about_vision_title TEXT DEFAULT 'Our Vision',
      about_vision_text TEXT DEFAULT 'A connected global community empowered by sustainable leadership and education.',
      donation_title TEXT DEFAULT 'Help Meru reach more communities',
      donation_subtitle TEXT DEFAULT 'Your contribution supports global exchange access, youth leadership programs, and outreach for learners and communities who need opportunity most.',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. News Ticker items
  await query(`
    CREATE TABLE IF NOT EXISTS ticker_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      label VARCHAR(50) NOT NULL DEFAULT 'NEWS',
      date VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      color VARCHAR(30) DEFAULT 'blue',
      display_order INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Animated Stats Counters
  await query(`
    CREATE TABLE IF NOT EXISTS home_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      target_number INT NOT NULL,
      suffix VARCHAR(20) DEFAULT '+',
      label VARCHAR(100) NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Core Values
  await query(`
    CREATE TABLE IF NOT EXISTS home_values (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      icon_name VARCHAR(50) DEFAULT 'Award',
      display_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Programs
  await query(`
    CREATE TABLE IF NOT EXISTS programs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'exchange',
      tag VARCHAR(100) DEFAULT 'Academic Exchange',
      description TEXT DEFAULT '',
      eligibility TEXT DEFAULT '',
      benefits JSONB DEFAULT '[]'::jsonb,
      date VARCHAR(100) DEFAULT '',
      location VARCHAR(200) DEFAULT '',
      featured_image_path TEXT DEFAULT '',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Testimonials
  await query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      role VARCHAR(150) DEFAULT '',
      quote TEXT NOT NULL,
      photo_path TEXT DEFAULT '',
      rating INT DEFAULT 5,
      program VARCHAR(100) DEFAULT 'general',
      region VARCHAR(100) DEFAULT 'Global',
      display_order INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Media library
  await query(`
    CREATE TABLE IF NOT EXISTS media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_type VARCHAR(20) NOT NULL,
      size BIGINT NOT NULL,
      path TEXT NOT NULL,
      url TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Content Pages
  await query(`
    CREATE TABLE IF NOT EXISTS pages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT DEFAULT '',
      status VARCHAR(20) DEFAULT 'published',
      meta_title VARCHAR(255) DEFAULT '',
      meta_description TEXT DEFAULT '',
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Contact Settings
  await query(`
    CREATE TABLE IF NOT EXISTS contact_settings (
      id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
      phone VARCHAR(100) DEFAULT '+1 (555) 123-4567',
      email VARCHAR(150) DEFAULT 'connect@meruglobal.org',
      address TEXT DEFAULT 'MERU Global Team, International Office',
      office_hours VARCHAR(150) DEFAULT 'Mon - Fri: 9:00 AM - 6:00 PM',
      facebook TEXT DEFAULT '',
      twitter TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      linkedin TEXT DEFAULT '',
      youtube TEXT DEFAULT '',
      google_maps_embed TEXT DEFAULT '',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Customer / Visitor Inquiries
  await query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) DEFAULT '',
      department VARCHAR(100) DEFAULT 'general',
      message TEXT NOT NULL,
      status VARCHAR(30) DEFAULT 'unread',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS history_moments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), year VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL, tag VARCHAR(100) DEFAULT 'Event', image_path TEXT DEFAULT '',
      description TEXT DEFAULT '', display_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS history_milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), year VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL, description TEXT DEFAULT '', icon_name VARCHAR(50) DEFAULT 'Compass',
      display_order INT DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS video_testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(255) NOT NULL,
      speaker VARCHAR(150) NOT NULL, role VARCHAR(150) DEFAULT '', organization VARCHAR(200) DEFAULT '',
      duration VARCHAR(30) DEFAULT '', video_url TEXT DEFAULT '', thumbnail_path TEXT DEFAULT '',
      category VARCHAR(100) DEFAULT 'academic', quote TEXT DEFAULT '', display_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS news_articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL, category VARCHAR(100) DEFAULT 'Announcement', excerpt TEXT DEFAULT '',
      content TEXT DEFAULT '', image_path TEXT DEFAULT '', author VARCHAR(150) DEFAULT '', display_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS news_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(255) NOT NULL,
      day VARCHAR(10) NOT NULL, month VARCHAR(20) NOT NULL, time VARCHAR(100) DEFAULT '',
      location VARCHAR(255) DEFAULT '', description TEXT DEFAULT '', link TEXT DEFAULT '', display_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✓ All PostgreSQL tables verified/created successfully.");

  // Seed default data if missing
  await seedInitialData();
}

async function seedInitialData() {
  // 1. Admin account
  const adminCheck = await query(`SELECT id FROM admins WHERE username = 'admin'`);
  if (adminCheck.rowCount === 0) {
    const passwordHash = await bcrypt.hash("MeruAdmin2026!", 12);
    await query(
      `INSERT INTO admins (username, password_hash, must_change_password) VALUES ($1, $2, $3)`,
      ["admin", passwordHash, false]
    );
    console.log("✓ Seeded default admin user: 'admin' (password: 'MeruAdmin2026!')");
  }

  // 2. Homepage settings
  const homeCheck = await query(`SELECT id FROM homepage_settings WHERE id = 'main'`);
  if (homeCheck.rowCount === 0) {
    await query(`
      INSERT INTO homepage_settings (
        id, hero_title, hero_subtitle, hero_image_path, hero_video_url, logo_rotation
      ) VALUES (
        'main', 'Reaching the Unreached', 'Connecting generations to the Great Commission', '', '', true
      );
    `);
    console.log("✓ Seeded default homepage settings.");
  }

  // 3. Ticker Items
  const tickerCheck = await query(`SELECT COUNT(*) FROM ticker_items`);
  if (parseInt(tickerCheck.rows[0].count, 10) === 0) {
    const defaultTickers = [
      { label: "EVENT", date: "JUNE 2026", text: "Global Youth Leadership Summit 2026 registration is now officially open.", color: "blue", order: 1 },
      { label: "EXPANSION", date: "MAY 2026", text: "Meru expands footprint to South America with new regional offices in Bogota.", color: "emerald", order: 2 },
      { label: "MILESTONE", date: "APRIL 2026", text: "Corporate Excellence Program achieves milestone of training 50,000+ professionals.", color: "purple", order: 3 },
      { label: "PARTNERS", date: "MARCH 2026", text: "Partnered with 12 new European academic organizations for global exchanges.", color: "amber", order: 4 },
    ];
    for (const t of defaultTickers) {
      await query(
        `INSERT INTO ticker_items (label, date, text, color, display_order) VALUES ($1, $2, $3, $4, $5)`,
        [t.label, t.date, t.text, t.color, t.order]
      );
    }
    console.log("✓ Seeded default news ticker items.");
  }

  // 4. Stats Counters
  const statsCheck = await query(`SELECT COUNT(*) FROM home_stats`);
  if (parseInt(statsCheck.rows[0].count, 10) === 0) {
    const defaultStats = [
      { target: 45, suffix: "+", label: "Countries Active", order: 1 },
      { target: 280, suffix: "+", label: "Programs Delivered", order: 2 },
      { target: 120, suffix: "+", label: "Global Partners", order: 3 },
      { target: 1500, suffix: "+", label: "Volunteers & Team", order: 4 },
    ];
    for (const s of defaultStats) {
      await query(
        `INSERT INTO home_stats (target_number, suffix, label, display_order) VALUES ($1, $2, $3, $4)`,
        [s.target, s.suffix, s.label, s.order]
      );
    }
    console.log("✓ Seeded default stats counters.");
  }

  // 5. Core Values
  const valuesCheck = await query(`SELECT COUNT(*) FROM home_values`);
  if (parseInt(valuesCheck.rows[0].count, 10) === 0) {
    const defaultValues = [
      { title: "Empowerment & Inclusion", desc: "Equipping young leaders from every demographic with world-class frameworks.", icon: "Users", order: 1 },
      { title: "Auditable Excellence", desc: "Rigorous operational transparency and measurable social impact benchmarks.", icon: "Award", order: 2 },
      { title: "Unreached Outreach", desc: "Prioritizing underserved, rural, and developing communities across continents.", icon: "HeartHandshake", order: 3 },
      { title: "Integrity & Faith", desc: "Grounded in ethical governance, compassionate collaboration, and enduring purpose.", icon: "ShieldCheck", order: 4 },
    ];
    for (const v of defaultValues) {
      await query(
        `INSERT INTO home_values (title, description, icon_name, display_order) VALUES ($1, $2, $3, $4)`,
        [v.title, v.desc, v.icon, v.order]
      );
    }
    console.log("✓ Seeded default core values.");
  }

  // 6. Programs
  const programsCheck = await query(`SELECT COUNT(*) FROM programs`);
  if (parseInt(programsCheck.rows[0].count, 10) === 0) {
    const defaultPrograms = [
      {
        name: "Global Exchange Seminar (Tokyo)",
        category: "exchange",
        tag: "Academic Exchange",
        description: "An intensive 4-week cultural immersion and technical research seminar hosted in collaboration with university partners in Shinjuku, Tokyo.",
        eligibility: "Enrolled university students or recent graduates (within 2 years). Basic English proficiency. Open to all majors.",
        benefits: JSON.stringify(["8 ECTS Academic Credits", "Tokyo Chamber of Commerce Certificate", "Company site tours (SoftBank, Sony)", "1-on-1 alumni mentorship"]),
        date: "2026-07-15",
        location: "Tokyo, Japan",
        featured_image_path: "",
      },
      {
        name: "Cross-Cultural Communications (Munich)",
        category: "exchange",
        tag: "Academic Exchange",
        description: "Explores multinational operations and communication behaviors within European business markets, hosted in Munich, Germany.",
        eligibility: "Senior undergraduates, graduates, or young corporate recruits. IELTS 6.5 or equivalent recommended.",
        benefits: JSON.stringify(["6 ECTS Academic Credits", "European Business Communications Cert", "Intercultural team workshops", "Munich startup hub networks"]),
        date: "2026-08-10",
        location: "Munich, Germany",
        featured_image_path: "",
      },
      {
        name: "Executive Corporate Governance",
        category: "corporate",
        tag: "Corporate Excellence",
        description: "Designed for senior executives and NGO leaders on risk compliance, fiduciary ethics, and strategic stakeholder alignment.",
        eligibility: "Mid-level to C-suite managers, NGO board directors, government administrative officers with 5+ years experience.",
        benefits: JSON.stringify(["Executive Leadership Credential", "Customized Enterprise Audit Toolkit", "Access to International Advisory Circle", "Hybrid schedule format"]),
        date: "2026-09-01",
        location: "London & Hybrid",
        featured_image_path: "",
      },
      {
        name: "Civic Youth Fellowship",
        category: "youth",
        tag: "Youth Leadership",
        description: "A transformative fellowship empowering high-potential young changemakers from developing nations with venture seed micro-grants.",
        eligibility: "Youth ages 18-26 with a proven track record of community service or grassroots initiative.",
        benefits: JSON.stringify(["Up to $5,000 venture micro-grant", "6 months of executive mentorship", "Quarterly global webinars", "Alumni network access in 45+ countries"]),
        date: "2026-10-05",
        location: "Bogota, Colombia",
        featured_image_path: "",
      }
    ];

    for (const p of defaultPrograms) {
      await query(
        `INSERT INTO programs (name, category, tag, description, eligibility, benefits, date, location, featured_image_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [p.name, p.category, p.tag, p.description, p.eligibility, p.benefits, p.date, p.location, p.featured_image_path]
      );
    }
    console.log("✓ Seeded default programs.");
  }

  // 7. Testimonials
  const testimonialsCheck = await query(`SELECT COUNT(*) FROM testimonials`);
  if (parseInt(testimonialsCheck.rows[0].count, 10) === 0) {
    const defaultTestimonials = [
      {
        name: "Mateo Silva",
        role: "Founder, Ecos Col",
        quote: "The Civic Youth Fellowship provided the exact funding metrics and legal support networks I needed to build my nonprofit in Colombia. It changed our trajectory entirely.",
        rating: 5,
        program: "youth",
        region: "South America",
        display_order: 1,
      },
      {
        name: "Lara Schmidt",
        role: "Student, Munich Exchange Program",
        quote: "Instructors in the Munich communications program were top-tier experts. Academic credits transferred to my home college without any administrative friction.",
        rating: 5,
        program: "exchange",
        region: "Europe",
        display_order: 2,
      },
      {
        name: "Robert Chen",
        role: "Compliance Director, Apex Logix",
        quote: "Corporate governance programs offered by Meru are concise, highly practical, and packed with auditable frameworks. Our compliance scores improved dramatically.",
        rating: 5,
        program: "corporate",
        region: "Asia-Pacific",
        display_order: 3,
      },
      {
        name: "Amina Yusuf",
        role: "Admissions Lead, Lagos Civic Board",
        quote: "Reaching the unreached is not just a motto for Meru; they live it. Their scholarship support made it possible for 8 of our rural coordinates to study exchange.",
        rating: 5,
        program: "youth",
        region: "Africa",
        display_order: 4,
      }
    ];

    for (const t of defaultTestimonials) {
      await query(
        `INSERT INTO testimonials (name, role, quote, rating, program, region, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [t.name, t.role, t.quote, t.rating, t.program, t.region, t.display_order]
      );
    }
    console.log("✓ Seeded default testimonials.");
  }

  // 8. Pages
  const pagesCheck = await query(`SELECT COUNT(*) FROM pages`);
  if (parseInt(pagesCheck.rows[0].count, 10) === 0) {
    const defaultPages = [
      { slug: "home", title: "Home", content: "Main landing page" },
      { slug: "about", title: "About Us", content: "About Meru Global Foundation" },
      { slug: "history", title: "History", content: "Historical milestones and foundation journey" },
      { slug: "programs", title: "Programs", content: "Comprehensive catalog of training and academic programs" },
      { slug: "testimonials", title: "Testimonials", content: "Stories and feedback from alumni and partners" },
      { slug: "contact", title: "Contact", content: "Get in touch with regional teams and international office" },
    ];
    for (const pg of defaultPages) {
      await query(
        `INSERT INTO pages (slug, title, content, status) VALUES ($1, $2, $3, 'published')`,
        [pg.slug, pg.title, pg.content]
      );
    }
    console.log("✓ Seeded default pages.");
  }

  // 9. Contact Settings
  const contactCheck = await query(`SELECT id FROM contact_settings WHERE id = 'main'`);
  if (contactCheck.rowCount === 0) {
    await query(`
      INSERT INTO contact_settings (
        id, phone, email, address, office_hours
      ) VALUES (
        'main', '+1 (555) 123-4567', 'connect@meruglobal.org', 'MERU Global Team, International Office', 'Mon - Fri: 9:00 AM - 6:00 PM'
      );
    `);
    console.log("✓ Seeded default contact settings.");
  }

  console.log("🎉 Database initialization and seeding completed!");
}

// Allow running directly via `npm run migrate`
if (process.argv[1]?.includes("migrate")) {
  runMigrations()
    .then(() => {
      console.log("Migration finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
