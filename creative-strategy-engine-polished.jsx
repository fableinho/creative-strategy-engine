import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// CREATIVE STRATEGY ENGINE — POLISHED UI SHOWCASE
// Demonstrates: Login · Dashboard · Project (Step 1)
// Copy patterns into your Next.js + Tailwind app
// ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Audiences" },
  { id: 2, label: "Pain & Desires" },
  { id: 3, label: "Messaging Angles" },
  { id: 4, label: "Hooks" },
  { id: 5, label: "Format Executions" },
];

// ─── DESIGN TOKENS (inject via <style> tag or globals.css) ───
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:        #111110;
    --ink-2:      #63635d;
    --ink-3:      #a8a39a;
    --surface:    #fafaf8;
    --surface-2:  #f2f1ee;
    --surface-3:  #e8e7e2;
    --white:      #ffffff;
    --border:     #e3e2dc;
    --border-2:   #d4d3cc;

    --amber:      #d97706;
    --amber-bg:   #fef3c7;
    --amber-border:#fcd34d;

    --accent:     #18181b;
    --accent-hover:#2d2d30;

    --red:        #dc2626;
    --red-bg:     #fef2f2;
    --red-border: #fecaca;

    --green:      #16a34a;
    --green-bg:   #f0fdf4;
    --green-border:#bbf7d0;

    --radius-sm:  6px;
    --radius:     10px;
    --radius-lg:  16px;
    --radius-xl:  24px;

    --shadow-xs:  0 1px 2px rgba(0,0,0,.06);
    --shadow-sm:  0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
    --shadow-md:  0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
    --shadow-lg:  0 12px 32px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.06);

    --font-display: 'Instrument Serif', Georgia, serif;
    --font-body:    'Inter', system-ui, sans-serif;
  }

  body {
    font-family: var(--font-body);
    background: var(--surface);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    line-height: 1.5;
  }

  /* ── GLOBAL NAV ─────────────────────────────────── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: 52px;
    background: rgba(250,250,248,.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px;
  }
  .nav-brand {
    display: flex; align-items: center; gap: 8px;
    font-weight: 600; font-size: 14px; color: var(--ink);
    text-decoration: none;
  }
  .nav-brand-icon {
    width: 26px; height: 26px; border-radius: 7px;
    background: var(--ink); display: flex; align-items: center;
    justify-content: center; color: white; font-size: 13px;
  }
  .nav-right {
    display: flex; align-items: center; gap: 16px;
  }
  .nav-email {
    font-size: 13px; color: var(--ink-2);
  }
  .nav-signout {
    font-size: 13px; color: var(--ink-2);
    background: none; border: none; cursor: pointer;
    padding: 4px 8px; border-radius: var(--radius-sm);
    transition: background .15s;
  }
  .nav-signout:hover { background: var(--surface-2); color: var(--ink); }

  /* ── BUTTONS ─────────────────────────────────────── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; border: none; cursor: pointer;
    font-family: var(--font-body); font-weight: 500;
    transition: all .15s; white-space: nowrap;
    text-decoration: none;
  }
  .btn-primary {
    background: var(--ink); color: white;
    padding: 9px 18px; border-radius: var(--radius);
    font-size: 14px; box-shadow: var(--shadow-xs);
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .btn-secondary {
    background: var(--white); color: var(--ink);
    padding: 8px 16px; border-radius: var(--radius);
    font-size: 13px; border: 1px solid var(--border);
    box-shadow: var(--shadow-xs);
  }
  .btn-secondary:hover { background: var(--surface-2); border-color: var(--border-2); }
  .btn-ghost {
    background: none; color: var(--ink-2);
    padding: 7px 14px; border-radius: var(--radius);
    font-size: 13px;
  }
  .btn-ghost:hover { background: var(--surface-2); color: var(--ink); }
  .btn-full { width: 100%; }

  /* ── BADGES ──────────────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 100px;
    font-size: 11px; font-weight: 500; letter-spacing: .02em;
  }
  .badge-draft { background: var(--surface-3); color: var(--ink-2); }
  .badge-active { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
  .badge-amber { background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }

  /* ─────────────────────────────────────────────────
     LOGIN PAGE
  ───────────────────────────────────────────────── */
  .login-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .login-left {
    background: var(--ink);
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    position: relative; overflow: hidden;
  }
  .login-left-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 20% 50%, rgba(255,200,100,.08) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(100,180,255,.06) 0%, transparent 50%);
    pointer-events: none;
  }
  .login-left-logo {
    display: flex; align-items: center; gap: 10px;
    color: white; font-weight: 600; font-size: 15px;
    position: relative; z-index: 1;
  }
  .login-left-logo-icon {
    width: 32px; height: 32px; border-radius: 9px;
    background: rgba(255,255,255,.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .login-left-content {
    position: relative; z-index: 1;
  }
  .login-tagline {
    font-family: var(--font-display);
    font-size: 44px; line-height: 1.1;
    color: white; letter-spacing: -.02em;
    margin-bottom: 20px;
  }
  .login-tagline em { font-style: italic; color: rgba(255,255,255,.55); }
  .login-sub {
    font-size: 15px; color: rgba(255,255,255,.5);
    line-height: 1.6; max-width: 320px;
  }
  .login-features {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; gap: 10px;
  }
  .login-feature {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: rgba(255,255,255,.55);
  }
  .login-feature-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,.3); flex-shrink: 0;
  }
  .login-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px; background: var(--surface);
  }
  .login-form-wrap {
    width: 100%; max-width: 380px;
  }
  .login-form-title {
    font-size: 24px; font-weight: 600; color: var(--ink);
    margin-bottom: 6px; letter-spacing: -.02em;
  }
  .login-form-sub {
    font-size: 14px; color: var(--ink-2); margin-bottom: 32px;
  }
  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 13px; font-weight: 500;
    color: var(--ink); margin-bottom: 6px;
  }
  .form-input {
    width: 100%; padding: 9px 12px;
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); font-size: 14px;
    font-family: var(--font-body); color: var(--ink);
    transition: border-color .15s, box-shadow .15s;
    outline: none; box-shadow: var(--shadow-xs);
  }
  .form-input:focus {
    border-color: var(--ink);
    box-shadow: 0 0 0 3px rgba(17,17,16,.08);
  }
  .form-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0; color: var(--ink-3); font-size: 12px;
  }
  .form-divider::before, .form-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }
  .btn-google {
    width: 100%; padding: 9px 16px; border-radius: var(--radius);
    border: 1px solid var(--border); background: var(--white);
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    color: var(--ink); cursor: pointer; display: flex;
    align-items: center; justify-content: center; gap: 10px;
    transition: all .15s; box-shadow: var(--shadow-xs);
  }
  .btn-google:hover { background: var(--surface-2); border-color: var(--border-2); }
  .login-footer {
    margin-top: 24px; text-align: center;
    font-size: 13px; color: var(--ink-2);
  }
  .login-footer a { color: var(--ink); font-weight: 500; text-decoration: none; }

  /* ─────────────────────────────────────────────────
     DASHBOARD PAGE
  ───────────────────────────────────────────────── */
  .page-wrap {
    padding-top: 52px; min-height: 100vh;
  }
  .dashboard-page {
    max-width: 960px; margin: 0 auto;
    padding: 48px 32px;
  }
  .dashboard-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 40px;
  }
  .dashboard-title {
    font-size: 28px; font-weight: 600; color: var(--ink);
    letter-spacing: -.03em; line-height: 1.2;
  }
  .dashboard-sub {
    font-size: 14px; color: var(--ink-2); margin-top: 4px;
  }
  .client-section { margin-bottom: 40px; }
  .client-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .client-avatar {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: white;
    letter-spacing: .04em; flex-shrink: 0;
  }
  .client-name {
    font-size: 13px; font-weight: 600; color: var(--ink);
    letter-spacing: -.01em;
  }
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  .project-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
    cursor: pointer;
    transition: all .2s;
    box-shadow: var(--shadow-xs);
    position: relative; overflow: hidden;
  }
  .project-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--client-color, var(--surface-3));
    opacity: 0;
    transition: opacity .2s;
  }
  .project-card:hover {
    border-color: var(--border-2);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  .project-card:hover::before { opacity: 1; }
  .project-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 12px;
  }
  .project-name {
    font-size: 15px; font-weight: 600; color: var(--ink);
    letter-spacing: -.02em; line-height: 1.3;
  }
  .project-client-tag {
    font-size: 12px; color: var(--ink-3); margin-top: 2px;
  }
  .project-card-menu {
    background: none; border: none; cursor: pointer;
    color: var(--ink-3); padding: 4px; border-radius: 6px;
    font-size: 16px; line-height: 1; transition: all .15s;
  }
  .project-card-menu:hover { background: var(--surface-2); color: var(--ink-2); }
  .project-progress {
    margin-bottom: 14px;
  }
  .progress-steps {
    display: flex; gap: 4px; margin-bottom: 8px;
  }
  .progress-step {
    height: 4px; border-radius: 2px; flex: 1;
    background: var(--surface-3);
    transition: background .2s;
  }
  .progress-step.done { background: var(--ink); }
  .progress-step.active { background: var(--ink); opacity: .4; }
  .progress-label {
    font-size: 11px; color: var(--ink-3); font-weight: 500;
  }
  .project-card-bottom {
    display: flex; align-items: center;
    justify-content: space-between; padding-top: 12px;
    border-top: 1px solid var(--surface-2);
  }
  .project-meta {
    font-size: 12px; color: var(--ink-3);
  }
  .project-card-new {
    background: var(--surface);
    border: 1.5px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
    cursor: pointer;
    transition: all .2s;
    display: flex; align-items: center; justify-content: center;
    gap: 8px; min-height: 130px;
    color: var(--ink-3); font-size: 13px; font-weight: 500;
  }
  .project-card-new:hover {
    border-color: var(--border-2);
    background: var(--surface-2); color: var(--ink-2);
  }
  .empty-state {
    text-align: center; padding: 80px 32px;
    color: var(--ink-3);
  }
  .empty-icon { font-size: 40px; margin-bottom: 16px; opacity: .5; }
  .empty-title { font-size: 16px; font-weight: 500; color: var(--ink-2); margin-bottom: 6px; }
  .empty-sub { font-size: 13px; line-height: 1.6; max-width: 320px; margin: 0 auto 24px; }

  /* ─────────────────────────────────────────────────
     PROJECT PAGE (Step 1)
  ───────────────────────────────────────────────── */
  .project-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: calc(100vh - 52px);
  }
  .sidebar {
    background: var(--white);
    border-right: 1px solid var(--border);
    padding: 24px 0;
    position: sticky; top: 52px;
    height: calc(100vh - 52px);
    overflow-y: auto;
  }
  .sidebar-project {
    padding: 0 20px 20px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }
  .sidebar-back {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--ink-3); margin-bottom: 12px;
    background: none; border: none; cursor: pointer;
    padding: 0; font-family: var(--font-body);
    transition: color .15s;
  }
  .sidebar-back:hover { color: var(--ink-2); }
  .sidebar-client-row {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 6px;
  }
  .sidebar-project-name {
    font-size: 14px; font-weight: 600; color: var(--ink);
    letter-spacing: -.02em;
  }
  .sidebar-client-name {
    font-size: 12px; color: var(--ink-3);
  }
  .sidebar-steps { padding: 0 12px; }
  .sidebar-step {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: var(--radius);
    cursor: pointer; transition: all .15s;
    margin-bottom: 2px; border: 1px solid transparent;
    background: none;
    font-family: var(--font-body);
    width: 100%; text-align: left;
  }
  .sidebar-step:hover { background: var(--surface); }
  .sidebar-step.active {
    background: var(--surface-2);
    border-color: var(--border);
  }
  .step-indicator {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
    border: 1.5px solid var(--border);
    color: var(--ink-3);
    background: var(--white);
  }
  .step-indicator.done {
    background: var(--ink); border-color: var(--ink);
    color: white; font-size: 10px;
  }
  .step-indicator.active {
    background: var(--ink); border-color: var(--ink); color: white;
  }
  .step-label {
    font-size: 13px; color: var(--ink-2); font-weight: 400;
  }
  .sidebar-step.active .step-label { color: var(--ink); font-weight: 500; }

  /* ── MAIN CONTENT AREA ───────────────────────── */
  .project-main {
    padding: 48px;
    max-width: 820px;
  }
  .step-header { margin-bottom: 40px; }
  .step-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: var(--ink-3);
    margin-bottom: 10px;
  }
  .step-title {
    font-family: var(--font-display);
    font-size: 38px; color: var(--ink);
    letter-spacing: -.02em; line-height: 1.15;
    margin-bottom: 12px;
  }
  .step-desc {
    font-size: 15px; color: var(--ink-2); line-height: 1.65;
    max-width: 560px;
  }

  /* AI Banner */
  .ai-banner {
    display: flex; align-items: center; gap: 12px;
    background: var(--surface-2); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 14px 18px;
    margin-bottom: 32px;
  }
  .ai-banner-icon {
    font-size: 20px; flex-shrink: 0;
  }
  .ai-banner-text {
    flex: 1;
  }
  .ai-banner-title {
    font-size: 13px; font-weight: 600; color: var(--ink);
    margin-bottom: 2px;
  }
  .ai-banner-sub {
    font-size: 12px; color: var(--ink-2); line-height: 1.5;
  }

  /* Choice cards (Step 1) */
  .choice-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 32px;
  }
  .choice-card {
    background: var(--white); border: 2px solid var(--border);
    border-radius: var(--radius-xl); padding: 28px;
    cursor: pointer; transition: all .2s;
    position: relative; overflow: hidden;
  }
  .choice-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 80% 20%, var(--glow-color, transparent) 0%, transparent 65%);
    opacity: 0; transition: opacity .3s;
    pointer-events: none;
  }
  .choice-card:hover { border-color: var(--border-2); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .choice-card:hover::after { opacity: 1; }
  .choice-card.selected { border-color: var(--ink); box-shadow: var(--shadow-md); }
  .choice-card.selected-pain { --glow-color: rgba(220, 38, 38, .06); }
  .choice-card.selected-desire { --glow-color: rgba(22, 163, 74, .06); }
  .choice-card-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 600; letter-spacing: .04em;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .badge-pain { background: var(--red-bg); color: var(--red); border: 1px solid var(--red-border); }
  .badge-desire { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
  .choice-card-title {
    font-size: 20px; font-weight: 600; color: var(--ink);
    margin-bottom: 4px; letter-spacing: -.02em;
  }
  .choice-card-sub {
    font-size: 13px; color: var(--ink-3); margin-bottom: 16px;
  }
  .choice-card-body {
    font-size: 13px; color: var(--ink-2); line-height: 1.6;
    margin-bottom: 20px;
  }
  .choice-card-question {
    font-size: 12px; font-weight: 600; color: var(--ink);
    font-style: italic; padding: 10px 14px;
    background: var(--surface); border-radius: var(--radius);
    border-left: 3px solid var(--border-2);
    margin-bottom: 16px;
  }
  .choice-examples-label {
    font-size: 10px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; color: var(--ink-3);
    margin-bottom: 8px;
  }
  .choice-examples { display: flex; flex-direction: column; gap: 5px; }
  .choice-example {
    font-size: 12px; color: var(--ink-2); font-style: italic;
    padding: 6px 10px; border-radius: var(--radius-sm);
    background: var(--surface); border: 1px solid var(--border);
    line-height: 1.4;
  }
  .choice-check {
    position: absolute; top: 20px; right: 20px;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--ink); display: flex; align-items: center;
    justify-content: center; color: white; font-size: 12px;
    opacity: 0; transform: scale(0.6);
    transition: all .2s;
  }
  .choice-card.selected .choice-check { opacity: 1; transform: scale(1); }

  /* Bottom action bar */
  .step-actions {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 24px; border-top: 1px solid var(--border);
    margin-top: 8px;
  }
  .step-actions-left { display: flex; align-items: center; gap: 8px; }

  /* ── SWITCHER ─────────────────────────────────── */
  .view-switcher {
    display: flex; gap: 0; margin-bottom: 48px;
    background: var(--surface-2);
    border-radius: 100px; padding: 3px;
    width: fit-content;
  }
  .view-tab {
    padding: 7px 20px; border-radius: 100px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all .15s; border: none; background: none;
    font-family: var(--font-body); color: var(--ink-2);
  }
  .view-tab.active {
    background: var(--white); color: var(--ink);
    box-shadow: var(--shadow-xs);
  }
`;

// ─── COMPONENTS ──────────────────────────────────────────────

function Nav({ email = "you@agency.com" }) {
  return (
    <nav className="nav">
      <a className="nav-brand" href="#">
        <div className="nav-brand-icon">⚡</div>
        Creative Strategy Engine
      </a>
      <div className="nav-right">
        <span className="nav-email">{email}</span>
        <button className="nav-signout">Sign out</button>
      </div>
    </nav>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────
function LoginPage() {
  return (
    <div className="login-page">
      {/* Left — Brand panel */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-logo">
          <div className="login-left-logo-icon">⚡</div>
          Creative Strategy Engine
        </div>

        <div className="login-left-content">
          <h1 className="login-tagline">
            Turn products<br />
            into <em>endless</em><br />
            messaging angles.
          </h1>
          <p className="login-sub">
            A systematic framework for creative strategists who develop
            direct response ads at scale.
          </p>
        </div>

        <div className="login-features">
          {[
            "AI-powered messaging angle generation",
            "Full funnel deployment across 22 formats",
            "Exportable creative briefs for production",
          ].map((f) => (
            <div className="login-feature" key={f}>
              <div className="login-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <h2 className="login-form-title">Welcome back</h2>
          <p className="login-form-sub">Sign in to your workspace</p>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@agency.com" />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" />
          </div>

          <button className="btn btn-primary btn-full" style={{ marginBottom: 0 }}>
            Sign in with Email
          </button>

          <div className="form-divider">or</div>

          <button className="btn-google">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="login-footer">
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Summer Shave Campaign",
    client: "Versuni",
    clientColor: "#d97706",
    clientInitials: "VE",
    currentStep: 4,
    status: "active",
    date: "19.2.2026",
    angles: 18,
  },
  {
    id: 2,
    name: "Q3 Product Launch Brief",
    client: "Versuni",
    clientColor: "#d97706",
    clientInitials: "VE",
    currentStep: 2,
    status: "draft",
    date: "15.2.2026",
    angles: 6,
  },
];

const STEP_LABELS = ["Audiences", "Pain & Desires", "Angles", "Hooks", "Formats"];

function ProjectCard({ project, onClick }) {
  return (
    <div
      className="project-card"
      style={{ "--client-color": project.clientColor }}
      onClick={onClick}
    >
      <div className="project-card-top">
        <div>
          <div className="project-name">{project.name}</div>
          <div className="project-client-tag">{project.client}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`badge badge-${project.status}`}>
            {project.status}
          </span>
          <button className="project-card-menu" onClick={e => e.stopPropagation()}>⋯</button>
        </div>
      </div>

      <div className="project-progress">
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`progress-step ${s < project.currentStep ? "done" : s === project.currentStep ? "active" : ""}`}
            />
          ))}
        </div>
        <div className="progress-label">
          Step {project.currentStep} of 5 — {STEP_LABELS[project.currentStep - 1]}
        </div>
      </div>

      <div className="project-card-bottom">
        <div className="project-meta">
          {project.angles} angles generated
        </div>
        <div className="project-meta">{project.date}</div>
      </div>
    </div>
  );
}

function DashboardPage({ onOpenProject }) {
  return (
    <div className="page-wrap">
      <Nav email="christian.fecke+test2@gmail.com" />
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Projects</h1>
            <p className="dashboard-sub">Your active campaigns and creative briefs</p>
          </div>
          <button className="btn btn-primary" onClick={onOpenProject}>
            + New Project
          </button>
        </div>

        {/* Client Group */}
        <div className="client-section">
          <div className="client-header">
            <div
              className="client-avatar"
              style={{ background: "#d97706" }}
            >
              VE
            </div>
            <span className="client-name">Versuni</span>
          </div>

          <div className="projects-grid">
            {MOCK_PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} onClick={onOpenProject} />
            ))}
            <div className="project-card-new" onClick={onOpenProject}>
              <span style={{ fontSize: 18 }}>+</span>
              New project for Versuni
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROJECT PAGE (Step 1) ────────────────────────────────────
function ProjectPage({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const completedSteps = [2, 3]; // mock

  return (
    <div className="page-wrap">
      <Nav email="christian.fecke+test2@gmail.com" />
      <div className="project-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-project">
            <button className="sidebar-back" onClick={onBack}>
              ← Dashboard
            </button>
            <div className="sidebar-client-row">
              <div
                className="client-avatar"
                style={{ width: 22, height: 22, borderRadius: 6, background: "#d97706", fontSize: 9 }}
              >
                VE
              </div>
              <span className="sidebar-client-name">Versuni</span>
            </div>
            <div className="sidebar-project-name">Summer Shave Campaign</div>
          </div>

          <div className="sidebar-steps">
            {STEPS.map((step, i) => {
              const isDone = completedSteps.includes(step.id);
              const isActive = step.id === currentStep;
              return (
                <button
                  key={step.id}
                  className={`sidebar-step ${isActive ? "active" : ""}`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={`step-indicator ${isDone ? "done" : isActive ? "active" : ""}`}>
                    {isDone ? "✓" : step.id}
                  </div>
                  <span className="step-label">{step.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="project-main">
          <div className="step-header">
            <div className="step-eyebrow">Step 1 of 5</div>
            <h1 className="step-title">Choose Your Creative Approach</h1>
            <p className="step-desc">
              Every product gets discovered one of two ways. Understanding which one
              drives your category tells you where to start building messaging.
            </p>
          </div>

          {/* AI banner */}
          <div className="ai-banner">
            <div className="ai-banner-icon">✦</div>
            <div className="ai-banner-text">
              <div className="ai-banner-title">AI Recommendation available</div>
              <div className="ai-banner-sub">
                Based on "OneUp" — a SaaS productivity tool — Claude recommends starting
                with <strong>Pain-First</strong> messaging. Users actively search for
                solutions to workflow friction.
              </div>
            </div>
            <button className="btn btn-secondary" style={{ flexShrink: 0 }}>
              Apply
            </button>
          </div>

          {/* Choice cards */}
          <div className="choice-grid">
            {/* Pain-First */}
            <div
              className={`choice-card ${selected === "pain" ? "selected selected-pain" : ""}`}
              style={{ "--glow-color": "rgba(220,38,38,.05)" }}
              onClick={() => setSelected("pain")}
            >
              <div className="choice-check">✓</div>
              <div className="choice-card-badge badge-pain">😣 Pain-First</div>
              <div className="choice-card-title">Start with what hurts</div>
              <div className="choice-card-sub">Lead with the problem</div>
              <div className="choice-card-body">
                People are actively searching for a solution to a specific, felt problem.
                They know something is wrong — they just need the fix.
              </div>
              <div className="choice-card-question">
                "What problem are people Googling right now?"
              </div>
              <div className="choice-examples-label">Example hooks</div>
              <div className="choice-examples">
                {[
                  '"Tired of wasting hours on manual reporting?"',
                  '"Stop losing customers to slow load times"',
                  '"The hidden cost of outdated software"',
                ].map((e) => (
                  <div className="choice-example" key={e}>{e}</div>
                ))}
              </div>
            </div>

            {/* Desire-First */}
            <div
              className={`choice-card ${selected === "desire" ? "selected selected-desire" : ""}`}
              style={{ "--glow-color": "rgba(22,163,74,.05)" }}
              onClick={() => setSelected("desire")}
            >
              <div className="choice-check">✓</div>
              <div className="choice-card-badge badge-desire">🌟 Desire-First</div>
              <div className="choice-card-title">Start with what they want</div>
              <div className="choice-card-sub">Lead with the vision</div>
              <div className="choice-card-body">
                People aren't searching for a fix — they're drawn to an identity,
                aesthetic, or aspiration. Lead with the vision, then introduce the
                product as the vehicle.
              </div>
              <div className="choice-card-question">
                "What lifestyle or identity does this product unlock?"
              </div>
              <div className="choice-examples-label">Example hooks</div>
              <div className="choice-examples">
                {[
                  '"Imagine closing deals 3x faster"',
                  '"What if your team could ship every week?"',
                  '"The fastest path to 10K subscribers"',
                ].map((e) => (
                  <div className="choice-example" key={e}>{e}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="step-actions">
            <div className="step-actions-left">
              <button className="btn btn-ghost">← Back</button>
            </div>
            <button
              className="btn btn-primary"
              style={{ opacity: selected ? 1 : 0.4, cursor: selected ? "pointer" : "not-allowed" }}
            >
              Continue →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("login");

  return (
    <>
      <style>{styles}</style>

      {view === "login" && (
        <LoginPage onContinue={() => setView("dashboard")} />
      )}

      {view === "dashboard" && (
        <DashboardPage onOpenProject={() => setView("project")} />
      )}

      {view === "project" && (
        <ProjectPage onBack={() => setView("dashboard")} />
      )}

      {/* Navigation for demo */}
      <div style={{
        position: "fixed", bottom: 20, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 9999,
        background: "rgba(17,17,16,.9)", backdropFilter: "blur(12px)",
        padding: "8px 12px", borderRadius: 100,
      }}>
        {["login", "dashboard", "project"].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "5px 14px", borderRadius: 100,
              background: view === v ? "white" : "transparent",
              color: view === v ? "#111" : "rgba(255,255,255,.6)",
              border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 500,
              fontFamily: "system-ui", textTransform: "capitalize",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </>
  );
}
