import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Database,
  FileVideo,
  GraduationCap,
  LineChart,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  User,
  UserPlus,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import heroImage from './assets/cricket-hero.png'
import './App.css'

const shotTypeOptions = [
  { value: 'cover_drive', label: 'Cover drive' },
  { value: 'pull_shot', label: 'Pull shot' },
  { value: 'straight_drive', label: 'Straight drive' },
  { value: 'cut_shot', label: 'Cut shot' },
  { value: 'bowling_action', label: 'Bowling action' },
  { value: 'footwork', label: 'Footwork' },
]

const experienceLevels = ['beginner', 'intermediate', 'advanced', 'academy']
const playerRoles = ['batter', 'bowler', 'all-rounder', 'wicketkeeper']

const navItems = [
  { label: 'Problem', id: 'problem' },
  { label: 'Solution', id: 'solution' },
  { label: 'Blueprint', id: 'blueprint' },
  { label: 'Players', id: 'players' },
  { label: 'Coaches', id: 'coaches' },
  { label: 'Security', id: 'security' },
  { label: 'Next', id: 'next' },
]

const shotTypeLookup = Object.fromEntries(shotTypeOptions.map((option) => [option.value, option.label]))

const solutionFeatures = [
  {
    title: 'Video Upload and Processing',
    body: 'Players and coaches upload cricket clips, tag a valid shot type, and follow a clear upload to processing to result flow.',
    icon: Upload,
  },
  {
    title: 'Performance Tracking',
    body: 'Each processed video becomes a time-stamped record that can be grouped by player and shot type.',
    icon: LineChart,
  },
  {
    title: 'Structured AI Feedback',
    body: 'The analysis model returns metrics, issues, strengths, and tips in a predictable format.',
    icon: Brain,
  },
  {
    title: 'Coach Dashboard',
    body: 'Academies manage students, batches, filters, and comparisons from one shared console.',
    icon: GraduationCap,
  },
]

const playerFeatureList = [
  'Upload your cricket videos',
  'Track upload to processing to result',
  'Review metrics, strengths, issues, and tips',
  'Compare progress over time by shot type',
]

const coachFeatureList = [
  'Manage multiple academy players',
  'Assign players to batches and squads',
  'Filter by player, batch, and shot type',
  'Compare players using balance score trends',
]

const securityPoints = [
  {
    title: 'Private player workspace',
    body: 'Each player owns a user_id and can only access videos and analytics linked to that account.',
    icon: User,
  },
  {
    title: 'Academy data isolation',
    body: 'Each coach is scoped to players listed in Academy_Players and cannot browse other academies.',
    icon: ShieldCheck,
  },
  {
    title: 'Backend enforcement',
    body: 'The PRD requires authorization in the API layer, so isolation is enforced in the backend and not only in the UI.',
    icon: Lock,
  },
]

const techStack = [
  { label: 'Frontend', value: 'React + Tailwind CSS' },
  { label: 'Backend', value: 'Express.js' },
  { label: 'AI service', value: 'Python + FastAPI' },
  { label: 'Database', value: 'MongoDB Atlas' },
  { label: 'Storage', value: 'S3 or Cloudinary' },
  { label: 'Vision + LLM', value: 'MediaPipe + Gemma 2B Instruct' },
]

const architectureFlow = [
  {
    title: 'React app',
    body: 'Role-based player and coach dashboards.',
    icon: Activity,
  },
  {
    title: 'Express API',
    body: 'Auth, uploads, analytics, and authorization.',
    icon: Building2,
  },
  {
    title: 'MongoDB metadata',
    body: 'Users, players, videos, and unified analysis records.',
    icon: Database,
  },
  {
    title: 'Cloud storage',
    body: 'Private video objects with signed access.',
    icon: Video,
  },
  {
    title: 'FastAPI processing',
    body: 'Frame extraction, pose detection, and metrics.',
    icon: Brain,
  },
  {
    title: 'Structured result',
    body: 'Metrics, issues, strengths, and tips flow back into the dashboards.',
    icon: Sparkles,
  },
]

const apiGroups = [
  {
    title: 'Auth',
    routes: ['POST /api/auth/register', 'POST /api/auth/login'],
  },
  {
    title: 'Videos',
    routes: ['POST /api/videos/upload', 'GET /api/videos/:id'],
  },
  {
    title: 'Analysis',
    routes: ['POST /api/analysis/start'],
  },
  {
    title: 'Analytics',
    routes: ['GET /api/analytics/player/:id', 'GET /api/analytics/coach/:id'],
  },
]

const databaseTables = [
  {
    name: 'Users',
    fields: ['_id', 'email', 'password_hash', 'role', 'name', 'created_at'],
  },
  {
    name: 'Players',
    fields: ['_id', 'user_id', 'age', 'experience_level', 'preferred_role'],
  },
  {
    name: 'Coaches',
    fields: ['_id', 'user_id', 'academy_name', 'certification'],
  },
  {
    name: 'Academy_Players',
    fields: ['_id', 'coach_id', 'player_id', 'batch_name', 'joined_date'],
  },
  {
    name: 'Videos',
    fields: ['_id', 'player_id', 'uploaded_by', 'video_url', 'shot_type', 'status', 'created_at'],
  },
  {
    name: 'Analysis',
    fields: ['_id', 'video_id', 'metrics', 'issues', 'strengths', 'tips', 'created_at'],
  },
]

const analysisTemplates = {
  cover_drive: {
    summary: 'Front-side control is improving, with a cleaner swing path through the ball.',
    metrics: {
      head_movement: 6.2,
      knee_angle: 142,
      balance_score: 0.84,
    },
    issues: ['front_foot_across_line', 'early_shoulder_open'],
    strengths: ['stable_head_position', 'high_front_elbow'],
    tips: [
      'Repeat 20 slow-motion cover drives with a cone just outside off stump.',
      'Hold the finish for a full count of two before resetting.',
    ],
  },
  pull_shot: {
    summary: 'Intent is good, but the back-foot base opens early when the ball climbs quickly.',
    metrics: {
      head_movement: 7.1,
      knee_angle: 138,
      balance_score: 0.77,
    },
    issues: ['back_foot_opens_early', 'late_wrist_roll'],
    strengths: ['quick_length_recognition', 'strong_weight_transfer'],
    tips: [
      'Use chest-high sidearm feeds and keep the back shoulder closed for one extra frame.',
      'Practice wrist roll with tennis-ball bounce drills into a ground target.',
    ],
  },
  straight_drive: {
    summary: 'The bat path is straight and repeatable, with strong balance through the line.',
    metrics: {
      head_movement: 5.8,
      knee_angle: 146,
      balance_score: 0.88,
    },
    issues: ['early_bottom_hand_push'],
    strengths: ['clean_vertical_bat_face', 'head_over_front_knee'],
    tips: [
      'Use underarm feeds and finish with the hands pointing at mid-off.',
      'Reduce bottom-hand pressure until after contact.',
    ],
  },
  cut_shot: {
    summary: 'Timing is good when width is available, but shot selection can tighten up.',
    metrics: {
      head_movement: 6.9,
      knee_angle: 139,
      balance_score: 0.76,
    },
    issues: ['reaching_too_close_to_body', 'contact_point_too_early'],
    strengths: ['fast_hands', 'good_square_contact'],
    tips: [
      'Set a width gate and only cut balls that pass outside the cone channel.',
      'Wait half a beat longer before committing the hands.',
    ],
  },
  bowling_action: {
    summary: 'Run-up rhythm is solid, with a release pattern that can gain more repeatability.',
    metrics: {
      head_movement: 5.5,
      knee_angle: 151,
      balance_score: 0.8,
    },
    issues: ['front_leg_not_braced', 'wrist_position_drops_early'],
    strengths: ['consistent_run_up_rhythm', 'good_hip_shoulder_separation'],
    tips: [
      'Record side-on and front-on angles to compare front-leg bracing at release.',
      'Use a target towel to train wrist position through release.',
    ],
  },
  footwork: {
    summary: 'The first movement is positive, but recovery steps can become more economical.',
    metrics: {
      head_movement: 6.7,
      knee_angle: 134,
      balance_score: 0.73,
    },
    issues: ['extra_shuffle_steps', 'late_reset_to_ready_position'],
    strengths: ['positive_first_movement', 'good_athletic_base'],
    tips: [
      'Run a cone grid with one delivery, one contact point, and one reset mark.',
      'Stay lower through the second step and reset the bat earlier.',
    ],
  },
}

const roadmap = [
  {
    title: 'Ship Express auth and RBAC',
    body: 'Implement register, login, password hashing, JWT sessions, and strict player versus coach authorization.',
  },
  {
    title: 'Connect MongoDB models',
    body: 'Map the PRD documents for Users, Players, Coaches, Academy_Players, Videos, and Analysis.',
  },
  {
    title: 'Move uploads to cloud storage',
    body: 'Store source videos privately in S3 or Cloudinary and save signed access metadata in Videos.',
  },
  {
    title: 'Add async analysis orchestration',
    body: 'Queue upload jobs, process them in FastAPI, and let the frontend poll status until results are ready.',
  },
  {
    title: 'Wire MediaPipe and Gemma',
    body: 'Compute pose metrics, pass structured inputs to the language model, and persist the unified analysis output.',
  },
]

function App() {
  const [view, setView] = useState('home')
  const [activeRole, setActiveRole] = useState('player')
  const [authMode, setAuthMode] = useState('signup')
  const [currentUser, setCurrentUser] = useState({
    name: 'Rohan Sharma',
    role: 'player',
    email: 'rohan@example.com',
    experience: 'intermediate',
    cricketRole: 'batter',
    academyName: 'Bhopal Cricket Academy',
    certification: 'Level 1 coach, 6 years',
  })
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    experience: 'intermediate',
    cricketRole: 'batter',
    academyName: '',
    certification: '',
  })
  const [playerVideos, setPlayerVideos] = useState(initialPlayerVideos)
  const [coachStudents, setCoachStudents] = useState(initialStudents)
  const [coachVideos, setCoachVideos] = useState(initialCoachVideos)

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startSignup = (role) => {
    setActiveRole(role)
    setAuthMode('signup')
    setView('home')
    window.setTimeout(() => scrollToSection('auth'), 50)
  }

  const openDashboard = (role) => {
    setActiveRole(role)
    setView(role)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateForm = (field, value) => {
    setForm((draft) => ({ ...draft, [field]: value }))
  }

  const handleAuthSubmit = (event) => {
    event.preventDefault()
    const nextUser = {
      name: form.fullName || (activeRole === 'coach' ? 'Coach Demo' : 'Player Demo'),
      role: activeRole,
      email: form.email || (activeRole === 'coach' ? 'coach@example.com' : 'player@example.com'),
      experience: form.experience,
      cricketRole: form.cricketRole,
      age: form.age,
      academyName: form.academyName || 'Bhopal Cricket Academy',
      certification: form.certification || 'Certified academy coach',
    }
    setCurrentUser(nextUser)
    openDashboard(activeRole)
  }

  if (view === 'player') {
    return (
      <PlayerDashboard
        currentUser={currentUser}
        videos={playerVideos}
        setVideos={setPlayerVideos}
        onHome={() => setView('home')}
      />
    )
  }

  if (view === 'coach') {
    return (
      <CoachDashboard
        currentUser={currentUser}
        students={coachStudents}
        setStudents={setCoachStudents}
        videos={coachVideos}
        setVideos={setCoachVideos}
        onHome={() => setView('home')}
      />
    )
  }

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#040711] text-slate-100">
      <Header
        onNavigate={scrollToSection}
        onPlayerSignup={() => startSignup('player')}
        onCoachSignup={() => startSignup('coach')}
      />
      <HeroSection onPlayerSignup={() => startSignup('player')} onCoachSignup={() => startSignup('coach')} />
      <ProblemSection />
      <SolutionSection />
      <BlueprintSection />
      <PlayerSection onOpenDashboard={() => openDashboard('player')} />
      <CoachSection onOpenDashboard={() => openDashboard('coach')} />
      <SecuritySection />
      <HowItWorksSection />
      <AuthSection
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        authMode={authMode}
        setAuthMode={setAuthMode}
        form={form}
        updateForm={updateForm}
        onSubmit={handleAuthSubmit}
      />
      <DatabaseSection />
      <RoadmapSection />
      <FinalCta onPlayerSignup={() => startSignup('player')} onCoachSignup={() => startSignup('coach')} />
      <Footer />
    </main>
  )
}

function Header({ onNavigate, onPlayerSignup, onCoachSignup }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#040711]/82 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex items-center gap-3 text-left"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="AI Cricket Coach home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
            <Activity size={19} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">AI Cricket Coach</span>
            <span className="block text-xs text-slate-400">Structured video feedback for cricket</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={onCoachSignup}>
            Coach
          </Button>
          <Button onClick={onPlayerSignup}>Start Free</Button>
        </div>
      </nav>
    </header>
  )
}

function HeroSection({ onPlayerSignup, onCoachSignup }) {
  return (
    <section className="relative min-h-[760px] overflow-hidden pt-16">
      <img
        src={heroImage}
        alt="Cricket batter training under neon lights"
        className="hero-image absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#040711_0%,rgba(4,7,17,0.95)_32%,rgba(4,7,17,0.68)_58%,rgba(4,7,17,0.3)_100%)]" />
      <div className="absolute inset-0 grid-glow opacity-40" />

      <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-200">
            <Sparkles size={16} aria-hidden="true" />
            Upload, processing, and result tracking for players and coaches
          </div>
          <h1 className="text-balance text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            AI Cricket Coach for Everyone
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Analyze your game, improve faster, and train smarter using AI-powered video insights.
          </p>

          <div className="mt-5 max-w-2xl rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-slate-300">
            Not replacing human coaches. Not promising perfect biomechanics. Built to deliver more consistent and measurable improvement tracking.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onPlayerSignup}>
              Sign Up as Player
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button size="lg" variant="secondary" onClick={onCoachSignup}>
              Sign Up as Coach
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            <HeroMetric value="6" label="validated shot types" />
            <HeroMetric value="Queue" label="upload to processing flow" />
            <HeroMetric value="RBAC" label="player and coach isolation" />
          </div>
        </div>

        <div className="hidden lg:block">
          <AnalysisPreview />
        </div>
      </div>
    </section>
  )
}

function AnalysisPreview() {
  return (
    <div className="float-y glass-panel relative ml-auto max-w-md overflow-hidden rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Processing queue</p>
          <p className="text-xs text-slate-400">cover_drive / player clip</p>
        </div>
        <span className="rounded-md bg-emerald-300/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
          Result ready
        </span>
      </div>

      <div className="analysis-scan relative overflow-hidden rounded-lg border border-white/10 bg-[#07111f] p-4">
        <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Upload', state: 'done' },
            { label: 'Processing', state: 'done' },
            { label: 'Result', state: 'active' },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-md border px-3 py-2 text-center ${
                item.state === 'active'
                  ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
                  : 'border-white/10 bg-white/[0.04] text-slate-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <PlayCircle size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-2 rounded-md bg-white/10">
              <div className="h-2 w-[84%] rounded-md bg-emerald-300" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Head movement</span>
              <span>Knee angle</span>
              <span>Balance</span>
            </div>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-slate-300">
          {[
            'Metric: balance_score 0.84',
            'Issue: front_foot_across_line',
            'Tip: repeat 20 slow-motion cover drives.',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <Check className="mt-0.5 shrink-0 text-emerald-300" size={16} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ProblemSection() {
  return (
    <Section id="problem" eyebrow="The Problem" title="Cricket improvement is still too expensive and too manual.">
      <div className="grid gap-4 lg:grid-cols-2">
        <ProblemCard
          icon={UserPlus}
          title="Young players cannot afford professional coaching"
          body="Talented players often depend on occasional feedback, unstructured practice, and guesswork because regular coaching is costly."
          stats={['Limited access', 'Slow feedback', 'No progress history']}
        />
        <ProblemCard
          icon={ClipboardList}
          title="Coaches spend hours manually analyzing videos"
          body="Academy coaches handle dozens of students and hundreds of clips, making consistent review and comparison difficult."
          stats={['Video overload', 'Manual notes', 'Hard batch comparison']}
        />
      </div>
    </Section>
  )
}

function ProblemCard({ icon: Icon, title, body, stats }) {
  return (
    <article className="glass-panel rounded-lg p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-rose-400/12 text-rose-200">
          <Icon size={21} aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase text-rose-100">Pain point</p>
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="mt-4 leading-7 text-slate-300">{body}</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {stats.map((stat) => (
          <span key={stat} className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
            {stat}
          </span>
        ))}
      </div>
    </article>
  )
}

function SolutionSection() {
  return (
    <Section
      id="solution"
      eyebrow="Our Solution"
      title="An AI-powered platform that turns cricket videos into structured feedback."
      subtitle="Players get time-stamped feedback records. Coaches get batch analytics and player comparisons. The frontend now follows the PRD flow instead of pretending everything is instant."
    >
      <div className="mb-6 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
        UX correction from the PRD: the app now uses Upload, Processing, and Result states instead of promising instant AI analysis.
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {solutionFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <article
              key={feature.title}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-white/[0.07]"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.body}</p>
            </article>
          )
        })}
      </div>
    </Section>
  )
}

function BlueprintSection() {
  return (
    <Section
      id="blueprint"
      eyebrow="Product Blueprint"
      title="The prototype now reflects the PRD architecture and API contract."
      subtitle="The UI shows the correct data model, strict shot schema, and the async flow expected from the production system."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-panel rounded-lg p-6">
          <h3 className="text-xl font-bold text-white">System Architecture</h3>
          <div className="mt-5 grid gap-3">
            {architectureFlow.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-bold text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{step.body}</p>
                    </div>
                  </div>
                  {index < architectureFlow.length - 1 && (
                    <ChevronRight className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-emerald-300/60 xl:block" size={18} aria-hidden="true" />
                  )}
                </div>
              )
            })}
          </div>
        </article>

        <div className="space-y-6">
          <article className="glass-panel rounded-lg p-6">
            <h3 className="text-xl font-bold text-white">Tech Stack</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {techStack.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-1 font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-lg p-6">
            <h3 className="text-xl font-bold text-white">Strict Shot Schema</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {shotTypeOptions.map((option) => (
                <span key={option.value} className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                  {option.value}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              The frontend now uses these validated values everywhere so the eventual Express API can reject anything outside this schema.
            </p>
          </article>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {apiGroups.map((group) => (
          <article key={group.title} className="rounded-lg border border-white/10 bg-[#071120] p-5">
            <p className="text-sm font-semibold uppercase text-cyan-200">{group.title}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {group.routes.map((route) => (
                <div key={route} className="rounded-md bg-white/[0.05] px-3 py-2 font-mono text-xs text-slate-200">
                  {route}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function PlayerSection({ onOpenDashboard }) {
  return (
    <Section
      id="players"
      eyebrow="For Players"
      title="A personal training space for every cricketer."
      subtitle="Upload clips, follow the processing state, review structured metrics, and compare progress over time."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <FeatureList items={playerFeatureList} />
        <PlayerMockup onOpenDashboard={onOpenDashboard} />
      </div>
    </Section>
  )
}

function CoachSection({ onOpenDashboard }) {
  return (
    <Section
      id="coaches"
      eyebrow="For Coaches and Academies"
      title="Manage students, batches, videos, and comparisons from one academy console."
      subtitle="Coaches can upload for selected players, filter by player, batch, and shot type, then compare balance score trends across the group."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <CoachMockup onOpenDashboard={onOpenDashboard} />
        <FeatureList items={coachFeatureList} />
      </div>
    </Section>
  )
}

function FeatureList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-300/10 text-emerald-200">
            <Check size={17} aria-hidden="true" />
          </span>
          <span className="font-medium text-slate-200">{item}</span>
        </div>
      ))}
    </div>
  )
}

function PlayerMockup({ onOpenDashboard }) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Player Dashboard</p>
          <h3 className="text-xl font-bold text-white">Rohan Sharma</h3>
        </div>
        <Button variant="secondary" onClick={onOpenDashboard}>
          Open Demo
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-[#071120] p-4">
          <div className="mb-4 flex items-center gap-3">
            <FileVideo className="text-emerald-300" size={22} aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Latest video</p>
              <p className="text-sm text-slate-400">cover_drive / processing complete</p>
            </div>
          </div>
          <div className="aspect-video rounded-lg border border-cyan-300/20 bg-[linear-gradient(135deg,#0b1728,#06141e)] p-3">
            <div className="flex h-full items-end gap-2">
              {[38, 68, 52, 84, 71].map((height, index) => (
                <div key={height + index} className="flex-1 rounded-md bg-emerald-300/70" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#071120] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-white">Progress by shot</p>
            <TrendingChip>+7 pts</TrendingChip>
          </div>
          <MiniMetric label="Cover drive" value={84} />
          <MiniMetric label="Pull shot" value={77} />
          <MiniMetric label="Footwork" value={73} />
          <div className="mt-4 rounded-md bg-cyan-300/10 p-3 text-sm text-cyan-100">
            Weakness tracker: front_foot_across_line is the most frequent issue this month.
          </div>
        </div>
      </div>
    </div>
  )
}

function CoachMockup({ onOpenDashboard }) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Coach Dashboard</p>
          <h3 className="text-xl font-bold text-white">Bhopal Cricket Academy</h3>
        </div>
        <Button variant="secondary" onClick={onOpenDashboard}>
          Open Demo
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {initialStudents.map((student, index) => (
          <div key={student.id} className="rounded-lg border border-white/10 bg-[#071120] p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/8 text-sm font-bold text-white">
                {student.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <div>
                <p className="font-semibold text-white">{student.name}</p>
                <p className="text-xs text-slate-400">{formatToken(student.role)}</p>
              </div>
            </div>
            <MiniMetric label="Balance score" value={88 - index * 6} />
            <p className="mt-3 text-xs text-slate-500">{student.batch}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/8 p-4 text-sm text-emerald-100">
        Batch insight: U-16 Elite leads average balance score, while Weekend Batch needs more footwork resets.
      </div>
    </div>
  )
}

function SecuritySection() {
  return (
    <Section
      id="security"
      eyebrow="Data Security"
      title="Your data is secure, scoped, and owner-linked."
      subtitle="The product model is designed around strict data isolation for individual players and academy coaches."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {securityPoints.map((point) => {
          const Icon = point.icon
          return (
            <article key={point.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
                <Icon size={23} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">{point.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{point.body}</p>
            </article>
          )
        })}
      </div>

      <div className="mt-6 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
        Data isolation in this prototype is represented in the UI, but the PRD is explicit that the real protection must be enforced in Express middleware and query filters.
      </div>
    </Section>
  )
}

function HowItWorksSection() {
  const steps = [
    { title: 'Upload video', icon: Upload },
    { title: 'Queue analysis job', icon: Zap },
    { title: 'Compute pose metrics', icon: Brain },
    { title: 'Review result', icon: LineChart },
  ]

  return (
    <Section id="how" eyebrow="How It Works" title="From raw video to measurable training feedback.">
      <div className="grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="relative rounded-lg border border-white/10 bg-[#071120] p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
              </div>
              <h3 className="font-bold text-white">{step.title}</h3>
              {index < steps.length - 1 && (
                <ChevronRight className="absolute right-5 top-1/2 hidden text-emerald-300/60 lg:block" size={22} aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function AuthSection({ activeRole, setActiveRole, authMode, setAuthMode, form, updateForm, onSubmit }) {
  const isCoach = activeRole === 'coach'

  return (
    <Section
      id="auth"
      eyebrow="Role-Based Access"
      title="Sign up as a player or coach."
      subtitle="The prototype opens the matching dashboard after signup or login and keeps the forms aligned with the PRD fields."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-lg p-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/20 p-1">
            {['player', 'coach'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`rounded-md px-4 py-3 text-sm font-semibold capitalize transition ${
                  activeRole === role ? 'bg-emerald-300 text-[#03110d]' : 'text-slate-300 hover:bg-white/8'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {['signup', 'login'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthMode(mode)}
                className={`rounded-md border px-4 py-3 text-sm font-semibold capitalize transition ${
                  authMode === mode
                    ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
                {isCoach ? <Building2 size={20} aria-hidden="true" /> : <User size={20} aria-hidden="true" />}
              </div>
              <div>
                <h3 className="font-bold text-white">{isCoach ? 'Coach Registration' : 'Player Registration'}</h3>
                <p className="text-sm text-slate-400">
                  {isCoach ? 'Academy workspace and student management' : 'Private profile and video analytics'}
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              {(isCoach
                ? ['Email, password, and full name', 'Academy or organization name', 'Certification and experience']
                : ['Email, password, and full name', 'Age and experience level', 'Preferred cricket role']
              ).map((item) => (
                <li key={item} className="flex gap-2">
                  <Check size={15} className="mt-0.5 text-emerald-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form className="glass-panel rounded-lg p-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateForm('email', value)}
              placeholder="you@example.com"
              required
            />
            <TextInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(value) => updateForm('password', value)}
              placeholder="Minimum 8 characters"
              required
            />

            {authMode === 'signup' && (
              <>
                <TextInput
                  label="Full Name"
                  value={form.fullName}
                  onChange={(value) => updateForm('fullName', value)}
                  placeholder={isCoach ? 'Coach name' : 'Player name'}
                  required
                />
                {isCoach ? (
                  <TextInput
                    label="Academy/Organization Name"
                    value={form.academyName}
                    onChange={(value) => updateForm('academyName', value)}
                    placeholder="Bhopal Cricket Academy"
                    required
                  />
                ) : (
                  <TextInput
                    label="Age"
                    type="number"
                    value={form.age}
                    onChange={(value) => updateForm('age', value)}
                    placeholder="16"
                    required
                  />
                )}

                {isCoach ? (
                  <div className="md:col-span-2">
                    <TextInput
                      label="Certification/Experience"
                      value={form.certification}
                      onChange={(value) => updateForm('certification', value)}
                      placeholder="Level 1 coach, 6 years"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <SelectInput
                      label="Experience Level"
                      value={form.experience}
                      options={experienceLevels}
                      onChange={(value) => updateForm('experience', value)}
                    />
                    <SelectInput
                      label="Preferred Cricket Role"
                      value={form.cricketRole}
                      options={playerRoles}
                      onChange={(value) => updateForm('cricketRole', value)}
                    />
                  </>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Free to get started. Production auth will plug into Express and MongoDB next.</p>
            <Button type="submit">
              {authMode === 'signup' ? `Create ${activeRole} account` : `Open ${activeRole} dashboard`}
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </Section>
  )
}

function DatabaseSection() {
  return (
    <Section
      id="database"
      eyebrow="MongoDB Data Model"
      title="A unified document model for isolation and analytics."
      subtitle="The app copy now matches the PRD: Mongo-style documents, batch support, video status, and unified analysis payloads."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {databaseTables.map((table) => (
          <article key={table.name} className="rounded-lg border border-white/10 bg-[#071120] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Database className="text-cyan-200" size={20} aria-hidden="true" />
              <h3 className="font-bold text-white">{table.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {table.fields.map((field) => (
                <span key={field} className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300">
                  {field}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function RoadmapSection() {
  return (
    <Section
      id="next"
      eyebrow="Suggested Next Steps"
      title="What is still left after this front-end alignment pass."
      subtitle="The main PRD gaps in the UI are now covered. The remaining work is the actual production backend and AI pipeline."
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {roadmap.map((item, index) => (
          <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/10 text-sm font-black text-emerald-200">
              {index + 1}
            </span>
            <h3 className="font-bold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function FinalCta({ onPlayerSignup, onCoachSignup }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(14,165,233,0.13),rgba(255,255,255,0.04))] p-8 lg:p-12">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-200">Free to get started</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Start Improving Your Game Today</h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Launch player and coach workspaces now, then wire the real Express and FastAPI services behind the same product flow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onPlayerSignup}>
              Join as Player
            </Button>
            <Button size="lg" variant="secondary" onClick={onCoachSignup}>
              Join as Coach
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-white">AI Cricket Coach</p>
          <p className="mt-1 text-sm text-slate-500">Copyright 2026. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <a href="#solution" className="rounded-md px-2 py-1 transition hover:bg-white/8 hover:text-white">
            About
          </a>
          <a href="#auth" className="rounded-md px-2 py-1 transition hover:bg-white/8 hover:text-white">
            Contact
          </a>
          <a href="#security" className="rounded-md px-2 py-1 transition hover:bg-white/8 hover:text-white">
            Privacy Policy
          </a>
          <a href="#blueprint" className="rounded-md px-2 py-1 transition hover:bg-white/8 hover:text-white">
            Terms
          </a>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: 'Community', icon: Users },
            { label: 'Video channel', icon: Video },
            { label: 'Updates', icon: Sparkles },
          ].map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                aria-label={social.label}
                href="#top"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-emerald-300/40 hover:text-emerald-200"
              >
                <Icon size={17} aria-hidden="true" />
              </a>
            )
          })}
        </div>
      </div>
    </footer>
  )
}

function PlayerDashboard({ currentUser, videos, setVideos, onHome }) {
  const [shotType, setShotType] = useState('cover_drive')
  const [fileName, setFileName] = useState('')
  const [uploadJob, setUploadJob] = useState(null)

  const stats = useMemo(() => buildCategoryStats(videos), [videos])
  const comparisons = useMemo(() => buildComparisonStats(videos), [videos])
  const weaknessCounts = useMemo(() => buildTokenCounts(videos, 'issues'), [videos])
  const strengthCounts = useMemo(() => buildTokenCounts(videos, 'strengths'), [videos])
  const timelinePoints = useMemo(() => buildTimelinePoints(videos), [videos])
  const latest = videos[0]
  const averageScore = Math.round(videos.reduce((sum, item) => sum + getVideoScore(item), 0) / videos.length)

  useEffect(() => {
    if (!uploadJob || uploadJob.stage === 'result') return undefined

    const timer = window.setTimeout(() => {
      if (uploadJob.stage === 'uploading') {
        setUploadJob((current) => (current ? { ...current, stage: 'processing', percent: 55 } : current))
        return
      }

      if (uploadJob.stage === 'processing') {
        const createdAt = uploadJob.createdAt
        const currentShotType = uploadJob.shotType
        const currentFileName = uploadJob.fileName

        setVideos((current) => [
          createVideoRecord({
            id: `PV-${String(120 + current.length).padStart(3, '0')}`,
            createdAt,
            shotType: currentShotType,
            uploadedBy: 'player',
            playerId: 'player-001',
            playerName: currentUser.name || 'Player Demo',
            videoUrl: currentFileName || `${currentShotType}.mp4`,
            seed: current.length,
          }),
          ...current,
        ])

        setUploadJob((current) =>
          current
            ? {
                ...current,
                stage: 'result',
                percent: 100,
                message: `${formatShotType(currentShotType)} result is now available.`,
              }
            : current,
        )
      }
    }, uploadJob.stage === 'uploading' ? 900 : 1500)

    return () => window.clearTimeout(timer)
  }, [currentUser.name, uploadJob, setVideos])

  const handleUpload = (event) => {
    event.preventDefault()
    setUploadJob({
      shotType,
      fileName,
      createdAt: new Date().toISOString(),
      stage: 'uploading',
      percent: 18,
      message: `Uploading ${fileName || `${shotType}.mp4`}`,
    })
    setFileName('')
  }

  return (
    <DashboardShell
      role="Player"
      title="Player Dashboard"
      subtitle="Private video history, time-series metrics, strength and weakness tracking, and upload processing states."
      currentUser={currentUser}
      onHome={onHome}
    >
      <div className="grid gap-5 lg:grid-cols-4">
        <StatCard icon={User} label="Player" value={currentUser.name || 'Player Demo'} detail={formatToken(currentUser.cricketRole || 'batter')} />
        <StatCard icon={Trophy} label="Experience" value={formatToken(currentUser.experience || 'intermediate')} detail="Personal profile" />
        <StatCard icon={Video} label="Videos analyzed" value={videos.length} detail="Computed from your records" />
        <StatCard icon={BarChart3} label="Average balance" value={`${averageScore}%`} detail="Across all processed videos" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="glass-panel rounded-lg p-6">
          <div className="mb-5 flex items-center gap-3">
            <Upload className="text-emerald-300" size={22} aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-white">Upload Video</h2>
              <p className="text-sm text-slate-400">Choose a clip, select a valid shot type, then follow upload to processing to result.</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
                className="block w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#03110d]"
              />
            </label>
            <SelectInput label="Shot type" value={shotType} options={shotTypeOptions} onChange={setShotType} />
            <Button type="submit" className="w-full justify-center" disabled={uploadJob && uploadJob.stage !== 'result'}>
              {uploadJob && uploadJob.stage !== 'result' ? 'Job in progress' : 'Start upload'}
              <Sparkles size={17} aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-5">
            <UploadLifecycleCard job={uploadJob} />
          </div>
        </section>

        <section className="glass-panel rounded-lg p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Latest Analysis Result</h2>
              <p className="text-sm text-slate-400">
                {formatShotType(latest.shotType)} reviewed on {formatDate(latest.createdAt)}
              </p>
            </div>
            <TrendingChip>{getVideoScore(latest)}%</TrendingChip>
          </div>
          <p className="leading-7 text-slate-300">{latest.analysis.summary}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <MetricCard label="Head movement" value={`${latest.analysis.metrics.head_movement.toFixed(1)} cm`} />
            <MetricCard label="Knee angle" value={`${Math.round(latest.analysis.metrics.knee_angle)} deg`} />
            <MetricCard label="Balance score" value={`${getVideoScore(latest)}%`} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AnalysisList title="Strengths" items={latest.analysis.strengths} tone="emerald" />
            <AnalysisList title="Issues" items={latest.analysis.issues} tone="amber" />
          </div>
          <TipsCard tips={latest.analysis.tips} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel rounded-lg p-6">
          <h2 className="text-xl font-bold text-white">Progress Over Time</h2>
          <p className="mt-2 text-sm text-slate-400">Each processed video becomes a time-stamped record. This view mirrors the PRD time-series analytics model.</p>
          <div className="mt-5">
            <TimelineChart points={timelinePoints} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ComparisonCard comparisons={comparisons} />
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <h3 className="font-bold text-white">Analytics by Shot Type</h3>
              <div className="mt-4 space-y-4">
                {stats.map((item) => (
                  <MiniMetric
                    key={item.shotType}
                    label={`${formatShotType(item.shotType)} (${item.count})`}
                    value={item.averageScore}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-bold text-white">Weakness Tracker</h2>
            <TokenTracker title="Most frequent issues" items={weaknessCounts} emptyLabel="No issues recorded yet." />
          </div>

          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-bold text-white">Strength Tracker</h2>
            <TokenTracker title="Most frequent strengths" items={strengthCounts} emptyLabel="No strengths recorded yet." tone="emerald" />
          </div>

          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Lock className="text-emerald-300" size={20} aria-hidden="true" />
              <h3 className="font-bold text-white">Only Own Data Visible</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This player workspace only renders videos and analytics tied to the signed-in player account. The backend still needs to enforce that isolation in production.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 glass-panel rounded-lg p-6">
        <h2 className="text-xl font-bold text-white">Video History</h2>
        <div className="mt-5 space-y-3">
          {videos.map((video) => (
            <VideoRow key={video.id} video={video} />
          ))}
        </div>
      </section>
    </DashboardShell>
  )
}

function CoachDashboard({ currentUser, students, setStudents, videos, setVideos, onHome }) {
  const [studentName, setStudentName] = useState('')
  const [studentRole, setStudentRole] = useState('batter')
  const [studentBatch, setStudentBatch] = useState('U-16 Elite')
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '')
  const [shotType, setShotType] = useState('cover_drive')
  const [fileName, setFileName] = useState('')
  const [playerFilter, setPlayerFilter] = useState('All')
  const [batchFilter, setBatchFilter] = useState('All')
  const [shotFilter, setShotFilter] = useState('All')
  const [uploadJob, setUploadJob] = useState(null)

  const batchOptions = useMemo(() => ['All', ...new Set(students.map((student) => student.batch))], [students])

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) => {
        const student = students.find((item) => item.id === video.playerId)
        const playerMatches = playerFilter === 'All' || video.playerId === playerFilter
        const shotMatches = shotFilter === 'All' || video.shotType === shotFilter
        const batchMatches = batchFilter === 'All' || student?.batch === batchFilter
        return playerMatches && shotMatches && batchMatches
      }),
    [batchFilter, playerFilter, shotFilter, students, videos],
  )

  const averageScore = Math.round(videos.reduce((sum, item) => sum + getVideoScore(item), 0) / videos.length)
  const batchAverages = useMemo(() => buildBatchAverages(videos, students, batchFilter), [batchFilter, students, videos])
  const playerRankings = useMemo(() => buildPlayerRankings(videos, students, batchFilter), [batchFilter, students, videos])

  useEffect(() => {
    if (!uploadJob || uploadJob.stage === 'result') return undefined

    const timer = window.setTimeout(() => {
      if (uploadJob.stage === 'uploading') {
        setUploadJob((current) => (current ? { ...current, stage: 'processing', percent: 57 } : current))
        return
      }

      if (uploadJob.stage === 'processing') {
        const student = students.find((item) => item.id === uploadJob.studentId) || students[0]
        if (!student) return

        const createdAt = uploadJob.createdAt
        const currentShotType = uploadJob.shotType
        const currentFileName = uploadJob.fileName

        setVideos((current) => [
          createVideoRecord({
            id: `CV-${String(230 + current.length).padStart(3, '0')}`,
            createdAt,
            shotType: currentShotType,
            uploadedBy: 'coach',
            playerId: student.id,
            playerName: student.name,
            videoUrl: currentFileName || `${student.name.toLowerCase().replaceAll(' ', '-')}-${currentShotType}.mp4`,
            seed: current.length + 2,
          }),
          ...current,
        ])

        setStudents((current) =>
          current.map((item) => (item.id === student.id ? { ...item, videos: item.videos + 1 } : item)),
        )

        setUploadJob((current) =>
          current
            ? {
                ...current,
                stage: 'result',
                percent: 100,
                message: `${student.name} now has a processed ${formatShotType(currentShotType)} result.`,
              }
            : current,
        )
      }
    }, uploadJob.stage === 'uploading' ? 900 : 1500)

    return () => window.clearTimeout(timer)
  }, [students, uploadJob, setStudents, setVideos])

  const addStudent = (event) => {
    event.preventDefault()
    if (!studentName.trim()) return

    const nextStudent = {
      id: `S-${String(students.length + 1).padStart(2, '0')}`,
      name: studentName.trim(),
      role: studentRole,
      batch: studentBatch,
      videos: 0,
    }

    setStudents([...students, nextStudent])
    setSelectedStudent(nextStudent.id)
    setStudentName('')
  }

  const uploadForStudent = (event) => {
    event.preventDefault()
    if (!selectedStudent) return

    setUploadJob({
      studentId: selectedStudent,
      shotType,
      fileName,
      createdAt: new Date().toISOString(),
      stage: 'uploading',
      percent: 16,
      message: `Uploading ${fileName || `${shotType}.mp4`}`,
    })
    setFileName('')
  }

  return (
    <DashboardShell
      role="Coach"
      title="Coach Dashboard"
      subtitle="Manage academy players, assign batches, follow upload processing, and compare students by balance score."
      currentUser={currentUser}
      onHome={onHome}
    >
      <div className="grid gap-5 lg:grid-cols-4">
        <StatCard icon={Building2} label="Academy" value={currentUser.academyName || 'Bhopal Cricket Academy'} detail="Coach scope" />
        <StatCard icon={Users} label="Students" value={students.length} detail="Managed players" />
        <StatCard icon={Video} label="Videos analyzed" value={videos.length} detail="Academy-only records" />
        <StatCard icon={BarChart3} label="Batch average" value={`${averageScore}%`} detail="Across processed videos" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="glass-panel rounded-lg p-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="text-emerald-300" size={22} aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-white">Manage Academy</h2>
              <p className="text-sm text-slate-400">Add players and assign them to a batch listed in Academy_Players.</p>
            </div>
          </div>
          <form onSubmit={addStudent} className="grid gap-4">
            <TextInput label="Student name" value={studentName} onChange={setStudentName} placeholder="New player name" />
            <SelectInput label="Role" value={studentRole} options={playerRoles} onChange={setStudentRole} />
            <SelectInput
              label="Squad/Batch"
              value={studentBatch}
              options={['U-16 Elite', 'U-19 Pace', 'Weekend Batch', 'Beginners']}
              onChange={setStudentBatch}
            />
            <Button type="submit" className="justify-center">
              Add student
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div>
                  <p className="font-semibold text-white">{student.name}</p>
                  <p className="text-sm text-slate-400">
                    {student.batch} / {formatToken(student.role)}
                  </p>
                </div>
                <span className="rounded-md bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                  {student.videos} videos
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-lg p-6">
          <div className="mb-5 flex items-center gap-3">
            <Upload className="text-cyan-200" size={22} aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-white">Upload for Students</h2>
              <p className="text-sm text-slate-400">Select a student, use a strict shot type value, then wait for processing to finish.</p>
            </div>
          </div>
          <form onSubmit={uploadForStudent} className="grid gap-4 md:grid-cols-2">
            <SelectInput
              label="Student"
              value={selectedStudent}
              options={students.map((student) => ({ label: student.name, value: student.id }))}
              onChange={setSelectedStudent}
            />
            <SelectInput label="Shot type" value={shotType} options={shotTypeOptions} onChange={setShotType} />
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
                className="block w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#03111d]"
              />
            </label>
            <Button type="submit" className="justify-center md:col-span-2" disabled={uploadJob && uploadJob.stage !== 'result'}>
              {uploadJob && uploadJob.stage !== 'result' ? 'Job in progress' : 'Start upload'}
              <Sparkles size={17} aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-5">
            <UploadLifecycleCard job={uploadJob} />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel rounded-lg p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Batch Analytics</h2>
              <p className="text-sm text-slate-400">Filter by player, batch, and shot type to compare students.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <SelectInput
                label="Filter player"
                value={playerFilter}
                options={[{ label: 'All players', value: 'All' }, ...students.map((student) => ({ label: student.name, value: student.id }))]}
                onChange={setPlayerFilter}
              />
              <SelectInput
                label="Filter batch"
                value={batchFilter}
                options={batchOptions.map((batch) => ({ label: batch === 'All' ? 'All batches' : batch, value: batch }))}
                onChange={setBatchFilter}
              />
              <SelectInput
                label="Filter shot"
                value={shotFilter}
                options={[{ label: 'All shots', value: 'All' }, ...shotTypeOptions]}
                onChange={setShotFilter}
              />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {filteredVideos.map((video) => (
              <VideoRow key={video.id} video={video} showPlayer />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-bold text-white">Batch Averages</h2>
            <div className="mt-4 space-y-4">
              {batchAverages.map((batch) => (
                <MiniMetric key={batch.batch} label={`${batch.batch} (${batch.count})`} value={batch.averageScore} />
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-bold text-white">Player Comparison</h2>
            <div className="mt-4 space-y-3">
              {playerRankings.map((player, index) => (
                <div key={player.playerId} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        #{index + 1} {player.playerName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {player.batch} / {player.videoCount} videos
                      </p>
                    </div>
                    <TrendingChip>{player.averageScore}%</TrendingChip>
                  </div>
                  <div className="mt-3">
                    <MiniMetric label="Balance score trend" value={player.averageScore} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-300" size={20} aria-hidden="true" />
              <h3 className="font-bold text-white">Academy Data Isolation</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This coach dashboard only renders data for students linked to this academy. The real API will need the Academy_Players relation to enforce this on every query.
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function DashboardShell({ role, title, subtitle, currentUser, onHome, children }) {
  return (
    <main className="min-h-screen bg-[#040711] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#040711]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <button type="button" className="flex items-center gap-3 text-left" onClick={onHome}>
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
              <Activity size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">AI Cricket Coach</span>
              <span className="block text-xs text-slate-400">{role} workspace</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{currentUser.name || `${role} Demo`}</p>
              <p className="text-xs text-slate-400">{currentUser.email || 'demo@aicricketcoach.app'}</p>
            </div>
            <Button variant="secondary" onClick={onHome}>
              Back to site
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-emerald-200">{role} Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-slate-400">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

function Section({ id, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-emerald-200">{eyebrow}</p>
          <h2 className="text-balance mt-3 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
          {subtitle && <p className="mt-4 text-lg leading-8 text-slate-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', onClick, disabled = false }) {
  const variants = {
    primary:
      'border-emerald-300/60 bg-[linear-gradient(135deg,#5eea9f,#22d3ee)] text-[#02110c] shadow-[0_16px_40px_rgba(45,212,191,0.22)] hover:brightness-110',
    secondary: 'border-white/15 bg-white/8 text-white hover:border-cyan-300/50 hover:bg-cyan-300/10',
    ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/8 hover:text-white',
  }
  const sizes = {
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#040711] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

function HeroMetric({ value, label }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      </div>
      <p className="truncate text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, type = 'text', required = false }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/20"
      />
    </label>
  )
}

function SelectInput({ label, value, options, onChange }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#071120] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
      >
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? formatToken(option) : option.label
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    </label>
  )
}

function MiniMetric({ label, value }) {
  const safeValue = Math.max(0, Math.min(Number(value), 100))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{safeValue}%</span>
      </div>
      <div className="h-2 rounded-md bg-white/10">
        <div className="h-2 rounded-md bg-[linear-gradient(90deg,#34d399,#22d3ee)]" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}

function TrendingChip({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-xs font-bold text-emerald-100">
      <LineChart size={13} aria-hidden="true" />
      {children}
    </span>
  )
}

function UploadLifecycleCard({ job }) {
  const currentStage = job?.stage || 'ready'
  const stages = ['uploading', 'processing', 'result']

  return (
    <div className="rounded-lg border border-white/10 bg-[#071120] p-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {stages.map((stage, index) => {
          const stageDone = stages.indexOf(currentStage) > index || currentStage === 'result' && stage === 'result'
          const stageActive = currentStage === stage
          return (
            <div
              key={stage}
              className={`rounded-md border px-3 py-2 text-center text-sm ${
                stageActive
                  ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
                  : stageDone
                    ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-white/[0.04] text-slate-500'
              }`}
            >
              {formatToken(stage)}
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-md bg-white/10">
          <div className="h-2 rounded-md bg-[linear-gradient(90deg,#34d399,#22d3ee)] transition-all" style={{ width: `${job?.percent || 0}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-300">
          {job?.message || 'Ready for the next upload. The result panel will update after processing completes.'}
        </p>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function TipsCard({ tips }) {
  return (
    <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
      <h3 className="font-bold text-white">Coaching Tips</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-cyan-100">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <Check size={15} className="mt-1 shrink-0 text-cyan-100" aria-hidden="true" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TimelineChart({ points }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex h-56 items-end gap-3">
        {points.map((point) => (
          <div key={`${point.label}-${point.score}`} className="flex flex-1 flex-col items-center gap-3">
            <span className="text-xs font-semibold text-white">{point.score}%</span>
            <div className="flex h-40 w-full items-end">
              <div className="w-full rounded-t-md bg-[linear-gradient(180deg,#22d3ee,#34d399)]" style={{ height: `${Math.max(point.score, 12)}%` }} />
            </div>
            <span className="text-center text-xs text-slate-500">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonCard({ comparisons }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h3 className="font-bold text-white">Compare Improvements</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">Latest balance score minus the average of previous records for the same shot type.</p>
      <div className="mt-4 space-y-3">
        {comparisons.map((comparison) => (
          <div key={comparison.shotType} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-3">
            <span className="text-sm text-slate-300">{formatShotType(comparison.shotType)}</span>
            <span className={`text-sm font-bold ${comparison.delta >= 0 ? 'text-emerald-200' : 'text-amber-200'}`}>
              {comparison.delta >= 0 ? '+' : ''}
              {comparison.delta} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TokenTracker({ title, items, emptyLabel, tone = 'amber' }) {
  const iconTone = tone === 'emerald' ? 'text-emerald-300' : 'text-amber-300'

  return (
    <div>
      <p className="mt-2 text-sm text-slate-400">{title}</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500">{emptyLabel}</p>}
        {items.map((item) => (
          <div key={item.token} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
            <div className="flex items-center gap-3">
              <Check size={15} className={iconTone} aria-hidden="true" />
              <span className="text-sm text-slate-300">{formatToken(item.token)}</span>
            </div>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs font-semibold text-white">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoRow({ video, showPlayer = false }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-white">
              {showPlayer ? `${video.playerName} / ${formatShotType(video.shotType)}` : formatShotType(video.shotType)}
            </h3>
            <span className="rounded-md bg-white/[0.07] px-2 py-1 text-xs text-slate-400">{video.id}</span>
            <span className="rounded-md bg-emerald-300/10 px-2 py-1 text-xs text-emerald-100">{video.status}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(video.createdAt)} / uploaded by {formatToken(video.uploadedBy)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{video.analysis.summary}</p>
        </div>
        <div className="min-w-32">
          <TrendingChip>{getVideoScore(video)}%</TrendingChip>
        </div>
      </div>
    </article>
  )
}

function AnalysisList({ title, items, tone }) {
  const toneClass = tone === 'emerald' ? 'text-emerald-300' : 'text-amber-300'

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check size={15} className={`mt-0.5 shrink-0 ${toneClass}`} aria-hidden="true" />
            {formatToken(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatToken(value) {
  return String(value)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatShotType(value) {
  return shotTypeLookup[value] || formatToken(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getVideoScore(video) {
  return Math.round(video.analysis.metrics.balance_score * 100)
}

function createVideoRecord({ id, createdAt, shotType, uploadedBy, playerId, playerName, videoUrl, seed = 0 }) {
  const template = analysisTemplates[shotType] || analysisTemplates.cover_drive
  const balanceScore = clamp(template.metrics.balance_score + ((seed % 5) - 2) * 0.01, 0.65, 0.96)
  const headMovement = Number((template.metrics.head_movement + ((seed % 4) - 1.5) * 0.2).toFixed(1))
  const kneeAngle = Math.round(template.metrics.knee_angle + ((seed % 3) - 1))

  return {
    id,
    playerId,
    playerName,
    shotType,
    uploadedBy,
    videoUrl,
    status: 'done',
    createdAt,
    analysis: {
      summary: template.summary,
      metrics: {
        head_movement: headMovement,
        knee_angle: kneeAngle,
        balance_score: Number(balanceScore.toFixed(2)),
      },
      issues: [...template.issues],
      strengths: [...template.strengths],
      tips: [...template.tips],
      created_at: createdAt,
    },
  }
}

function buildCategoryStats(videos) {
  const grouped = videos.reduce((acc, video) => {
    if (!acc[video.shotType]) {
      acc[video.shotType] = { shotType: video.shotType, count: 0, total: 0 }
    }

    acc[video.shotType].count += 1
    acc[video.shotType].total += getVideoScore(video)
    return acc
  }, {})

  return Object.values(grouped).map((item) => ({
    shotType: item.shotType,
    count: item.count,
    averageScore: Math.round(item.total / item.count),
  }))
}

function buildComparisonStats(videos) {
  const grouped = videos.reduce((acc, video) => {
    if (!acc[video.shotType]) acc[video.shotType] = []
    acc[video.shotType].push(video)
    return acc
  }, {})

  return Object.values(grouped).map((group) => {
    const ordered = [...group].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    const latest = getVideoScore(ordered[ordered.length - 1])
    const previous = ordered.slice(0, -1)
    const baseline = previous.length
      ? Math.round(previous.reduce((sum, video) => sum + getVideoScore(video), 0) / previous.length)
      : latest

    return {
      shotType: ordered[ordered.length - 1].shotType,
      delta: latest - baseline,
    }
  })
}

function buildTokenCounts(videos, field) {
  const counts = {}

  videos.forEach((video) => {
    video.analysis[field].forEach((token) => {
      counts[token] = (counts[token] || 0) + 1
    })
  })

  return Object.entries(counts)
    .map(([token, count]) => ({ token, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
}

function buildTimelinePoints(videos) {
  return [...videos]
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    .slice(-6)
    .map((video) => ({
      label: new Intl.DateTimeFormat('en-IN', { month: 'short', day: '2-digit' }).format(new Date(video.createdAt)),
      score: getVideoScore(video),
    }))
}

function buildBatchAverages(videos, students, batchFilter) {
  const grouped = {}

  videos.forEach((video) => {
    const student = students.find((item) => item.id === video.playerId)
    if (!student) return
    if (batchFilter !== 'All' && student.batch !== batchFilter) return

    if (!grouped[student.batch]) {
      grouped[student.batch] = { batch: student.batch, count: 0, total: 0 }
    }

    grouped[student.batch].count += 1
    grouped[student.batch].total += getVideoScore(video)
  })

  return Object.values(grouped).map((batch) => ({
    batch: batch.batch,
    count: batch.count,
    averageScore: Math.round(batch.total / batch.count),
  }))
}

function buildPlayerRankings(videos, students, batchFilter) {
  const grouped = {}

  videos.forEach((video) => {
    const student = students.find((item) => item.id === video.playerId)
    if (!student) return
    if (batchFilter !== 'All' && student.batch !== batchFilter) return

    if (!grouped[student.id]) {
      grouped[student.id] = {
        playerId: student.id,
        playerName: student.name,
        batch: student.batch,
        videoCount: 0,
        total: 0,
      }
    }

    grouped[student.id].videoCount += 1
    grouped[student.id].total += getVideoScore(video)
  })

  return Object.values(grouped)
    .map((player) => ({
      ...player,
      averageScore: Math.round(player.total / player.videoCount),
    }))
    .sort((left, right) => right.averageScore - left.averageScore)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const initialPlayerVideos = [
  createVideoRecord({
    id: 'PV-104',
    createdAt: '2026-05-01T16:45:00+05:30',
    shotType: 'cover_drive',
    uploadedBy: 'player',
    playerId: 'player-001',
    playerName: 'Rohan Sharma',
    videoUrl: 'cover-drive-session.mp4',
    seed: 1,
  }),
  createVideoRecord({
    id: 'PV-098',
    createdAt: '2026-04-27T10:15:00+05:30',
    shotType: 'pull_shot',
    uploadedBy: 'player',
    playerId: 'player-001',
    playerName: 'Rohan Sharma',
    videoUrl: 'pull-shot-drill.mp4',
    seed: 2,
  }),
  createVideoRecord({
    id: 'PV-091',
    createdAt: '2026-04-18T08:20:00+05:30',
    shotType: 'footwork',
    uploadedBy: 'player',
    playerId: 'player-001',
    playerName: 'Rohan Sharma',
    videoUrl: 'footwork-grid.mp4',
    seed: 3,
  }),
  createVideoRecord({
    id: 'PV-083',
    createdAt: '2026-04-11T17:10:00+05:30',
    shotType: 'cover_drive',
    uploadedBy: 'player',
    playerId: 'player-001',
    playerName: 'Rohan Sharma',
    videoUrl: 'cover-drive-week-2.mp4',
    seed: 4,
  }),
]

const initialStudents = [
  { id: 'S-01', name: 'Aarav Mehta', role: 'batter', batch: 'U-16 Elite', videos: 7 },
  { id: 'S-02', name: 'Isha Rao', role: 'all-rounder', batch: 'U-19 Pace', videos: 5 },
  { id: 'S-03', name: 'Kabir Sen', role: 'bowler', batch: 'Weekend Batch', videos: 4 },
]

const initialCoachVideos = [
  createVideoRecord({
    id: 'CV-220',
    createdAt: '2026-05-02T09:40:00+05:30',
    shotType: 'straight_drive',
    uploadedBy: 'coach',
    playerId: 'S-01',
    playerName: 'Aarav Mehta',
    videoUrl: 'aarav-straight-drive.mp4',
    seed: 2,
  }),
  createVideoRecord({
    id: 'CV-211',
    createdAt: '2026-04-30T13:10:00+05:30',
    shotType: 'bowling_action',
    uploadedBy: 'coach',
    playerId: 'S-02',
    playerName: 'Isha Rao',
    videoUrl: 'isha-bowling-action.mp4',
    seed: 3,
  }),
  createVideoRecord({
    id: 'CV-205',
    createdAt: '2026-04-24T18:00:00+05:30',
    shotType: 'footwork',
    uploadedBy: 'coach',
    playerId: 'S-03',
    playerName: 'Kabir Sen',
    videoUrl: 'kabir-footwork.mp4',
    seed: 4,
  }),
  createVideoRecord({
    id: 'CV-198',
    createdAt: '2026-04-18T11:30:00+05:30',
    shotType: 'cover_drive',
    uploadedBy: 'coach',
    playerId: 'S-01',
    playerName: 'Aarav Mehta',
    videoUrl: 'aarav-cover-drive.mp4',
    seed: 5,
  }),
]

export default App
