import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, ChevronDown, CircleHelp, Fingerprint, KeyRound, LockKeyhole, Menu, Radio, Search, Shield, ShieldAlert, Sparkles, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi, mysteryApi } from '../services/api.js';

const presetSeeds = [
  { label: 'THE VAULT WENT SILENT', type: 'heist', scenario: 'A sealed museum vault is found open at dawn. Nothing appears missing, but the night guard insists the alarm never sounded.' },
  { label: 'SIGNAL LOST', type: 'disappearance', scenario: 'A research lead disappears from a locked laboratory during a six-minute network outage. Every badge record says they never left.' },
  { label: 'THE GLASSHOUSE FILE', type: 'corporate espionage', scenario: 'A confidential design file leaks hours before a board vote. Four people had access, and one message was deleted.' },
];

export default function Home({ session, onAuth, onSignOut }) {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState('');
  const [type, setType] = useState('general');
  const [difficulty, setDifficulty] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [recent, setRecent] = useState([]);
  const [legalPage, setLegalPage] = useState('');

  useEffect(() => {
    if (!session?.token) return;
    mysteryApi.list(session.token).then((result) => setRecent(result.mysteries || [])).catch(() => {});
  }, [session]);

  async function createCase(event) {
    event.preventDefault();
    setError('');
    if (!session?.token) { setAuthOpen(true); return; }
    if (scenario.trim().length < 12) { setError('Give the case engine at least 12 characters to work with.'); return; }
    setBusy(true);
    try {
      const response = await mysteryApi.generate({ scenario: scenario.trim(), type, difficulty }, session.token);
      navigate(`/case/${response.mystery.id}`);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  async function submitAuth(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setAuthError('');
    setAuthBusy(true);
    const body = {
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
      ...(authMode === 'register' ? { username: String(form.get('username') || '').trim() } : {}),
    };
    try {
      const response = authMode === 'register' ? await authApi.register(body) : await authApi.login(body);
      onAuth({ token: response.token, user: response.user });
      setAuthOpen(false);
    } catch (cause) { setAuthError(cause.message); }
    finally { setAuthBusy(false); }
  }

  function usePreset(seed) {
    setScenario(seed.scenario);
    setType(seed.type);
    document.getElementById('create-case')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <main className="home-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AI Mystery Room home">
          <span className="brand-mark"><Fingerprint size={22} strokeWidth={1.5} /></span>
          <span className="brand-name">MYSTERY<span>ROOM</span><small>FORENSIC INTELLIGENCE</small></span>
        </a>
        <nav className="topnav" aria-label="Main navigation">
          <a href="#method">HOW IT WORKS</a>
          <a href="#case-seeds">CASE FILES</a>
          <a href="#create-case">OPEN A CASE</a>
        </nav>
        <div className="topbar-right">
          <span className="system-online"><i /> SYSTEM ONLINE</span>
          {session?.user ? (
            <button className="user-menu" onClick={onSignOut} title="Sign out"><UserRound size={15} /> {session.user.username} <span>EXIT</span></button>
          ) : (
            <button className="quiet-button" onClick={() => { setAuthMode('login'); setAuthOpen(true); }}>OPERATOR LOGIN <ArrowUpRight size={14} /></button>
          )}
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-rule" /> DIGITAL CRIME SCENE / INTAKE 01</div>
          <h1>EVERY CRIME<br />LEAVES A <span>TRACE.</span></h1>
          <p className="hero-lede">The truth is buried in the details. Enter a case, examine the evidence, and connect the contradictions before they disappear.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#create-case">INITIATE INVESTIGATION <ArrowRight size={17} /></a>
            <a className="text-link" href="#method">EXPLORE THE PROCESS <ArrowDown size={14} /></a>
          </div>
          <div className="hero-facts">
            <div><span className="fact-number">04</span><span>CASE DOSSIERS</span></div>
            <div><span className="fact-number">03</span><span>EVIDENCE STREAMS</span></div>
            <div><span className="fact-number">01</span><span>HIDDEN TRUTH</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Forensic case board illustration">
          <div className="visual-topline"><span>LIVE CASE MONITOR</span><span>FEED 00:01:42</span></div>
          <div className="radar-board">
            <div className="radar-rings"><div /><div /><div /><div /></div>
            <svg className="case-lines" viewBox="0 0 500 390" aria-hidden="true">
              <path d="M250 192 L135 95 M250 192 L366 90 M250 192 L120 296 M250 192 L382 296" />
              <path d="M135 95 L366 90 M120 296 L382 296" className="line-muted" />
            </svg>
            <div className="radar-core"><Fingerprint size={54} strokeWidth={1} /><span>CASE<br />SEALED</span></div>
            <div className="evidence-node node-one"><span className="node-icon"><Radio size={17} /></span><b>VOICE / 21:24</b><small>RECOVERED CHAT</small></div>
            <div className="evidence-node node-two"><span className="node-icon"><Search size={17} /></span><b>CAM 04 / 21:31</b><small>MOTION FLAG</small></div>
            <div className="evidence-node node-three"><span className="node-icon"><KeyRound size={17} /></span><b>TRACE / 7C-21</b><small>ACCESS ANOMALY</small></div>
            <div className="evidence-node node-four"><span className="node-icon"><ShieldAlert size={17} /></span><b>SUBJECT / 04</b><small>UNRESOLVED</small></div>
            <div className="scan-beam" />
          </div>
          <div className="visual-footer"><span><i className="status-dot" /> ENCRYPTED EVIDENCE STREAM</span><span>LATENCY 014 MS</span></div>
          <div className="visual-stamp">EVIDENCE<br />IS NEVER<br />SILENT.</div>
        </div>
      </section>

      <section className="ticker" aria-label="System notice">
        <div className="ticker-label"><Radio size={14} /> INCOMING TRANSMISSION</div>
        <p>“The west door never opened.” <span>— RECOVERED STATEMENT / 21:24</span></p>
        <span className="ticker-code">// SIGNAL RESTORED</span>
      </section>

      <section className="create-section" id="create-case">
        <div className="section-heading">
          <div><span className="section-index">01 / NEW INVESTIGATION</span><h2>Put the pieces<br /><em>in motion.</em></h2></div>
          <p>Submit a fictional seed. The case engine builds a closed investigation with four suspects, competing alibis, and a three-part evidence chain.</p>
        </div>
        <div className="intake-layout">
          <form className="intake-form panel" onSubmit={createCase}>
            <div className="panel-heading"><div><span className="live-indicator" /> INTAKE TERMINAL</div><span>INPUT ENCRYPTED</span></div>
            <label className="field-label" htmlFor="scenario">CASE SEED <span>REQUIRED</span></label>
            <textarea id="scenario" value={scenario} onChange={(event) => setScenario(event.target.value)} placeholder="Describe the incident, the place it happened, and what feels impossible..." maxLength={1200} rows={5} />
            <div className="field-meta"><span>FICTIONAL SCENARIOS ONLY</span><span>{scenario.length} / 1200</span></div>
            <div className="form-options">
              <label><span>INVESTIGATION TYPE</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="general">General mystery</option><option value="murder">Murder</option><option value="heist">Theft / heist</option><option value="disappearance">Disappearance</option><option value="cybercrime">Cybercrime</option><option value="corporate espionage">Corporate espionage</option><option value="sabotage">Sabotage</option></select><ChevronDown size={13} /></label>
              <label><span>DIFFICULTY</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="expert">Expert</option></select><ChevronDown size={13} /></label>
            </div>
            {error && <div className="inline-error" role="alert"><ShieldAlert size={15} /> {error}</div>}
            <button className="primary-button form-submit" type="submit" disabled={busy}>
              {busy ? <><span className="mini-spinner" /> SYNTHESIZING CASE FILE</> : <>GENERATE CASE <ArrowRight size={17} /></>}
            </button>
            <div className="form-assurance"><LockKeyhole size={13} /> SOLUTION SEALED UNTIL VERDICT</div>
          </form>

          <aside className="intake-side">
            <div className="side-note"><span className="side-note-number">A.</span><div><b>ONE FIXED TRUTH</b><p>The case solution is set before its evidence is created.</p></div></div>
            <div className="side-note"><span className="side-note-number">B.</span><div><b>THREE CONNECTED PROOFS</b><p>A message, a camera record, and a forensic trace converge.</p></div></div>
            <div className="side-note"><span className="side-note-number">C.</span><div><b>YOUR FINAL ACCUSATION</b><p>Pin clues, clear suspects, and lock in one name.</p></div></div>
            {!session?.user && <button className="account-prompt" onClick={() => { setAuthMode('register'); setAuthOpen(true); }}><Shield size={17} /><span><b>OPERATOR ACCOUNT REQUIRED</b><small>Register to save your case files and notes.</small></span><ArrowUpRight size={16} /></button>}
          </aside>
        </div>
      </section>

      {session?.user && recent.length > 0 && <section className="recent-section"><div className="recent-head"><span className="section-index">ARCHIVE / YOUR CASE FILES</span><span>{String(recent.length).padStart(2, '0')} SAVED</span></div><div className="recent-grid">{recent.slice(0, 3).map((item) => <button className="recent-card" key={item.id} onClick={() => navigate(`/case/${item.id}`)}><span className="recent-id">{item.id}</span><b>{item.title}</b><span>{item.generationMode === 'gemini' ? 'AI GENERATED' : 'LOCAL SIMULATION'} <ArrowUpRight size={13} /></span></button>)}</div></section>}

      <section className="method-section" id="method">
        <div className="section-heading compact"><div><span className="section-index">02 / FIELD PROTOCOL</span><h2>Follow the<br /><em>evidence.</em></h2></div><span className="method-annotation">THREE MOVES.<br />ONE CONCLUSION.</span></div>
        <div className="method-grid">
          <article><span className="method-number">01</span><div className="method-icon"><Sparkles size={20} /></div><h3>OPEN THE FILE</h3><p>Set a scenario in motion. The case engine creates four dossiers and locks its solution away.</p><span className="method-code">// SCENARIO → CASE</span></article>
          <article><span className="method-number">02</span><div className="method-icon"><Search size={20} /></div><h3>READ THE SIGNALS</h3><p>Recover messages, scrub surveillance frames, and inspect procedural forensic evidence.</p><span className="method-code">// EVIDENCE → THEORY</span></article>
          <article><span className="method-number">03</span><div className="method-icon"><BadgeCheck size={20} /></div><h3>LOCK YOUR VERDICT</h3><p>Connect the contradictions, make one accusation, then open the sealed solution.</p><span className="method-code">// THEORY → VERDICT</span></article>
        </div>
      </section>

      <section className="case-seeds" id="case-seeds">
        <div className="section-heading compact"><div><span className="section-index">03 / TRAINING SCENARIOS</span><h2>Need a <em>starting point?</em></h2></div><span className="seeds-copy">SELECT A SEED TO LOAD THE INTAKE TERMINAL</span></div>
        <div className="seed-grid">{presetSeeds.map((seed, index) => <button className="seed-card" key={seed.label} onClick={() => usePreset(seed)}><span>SIMULATION {String(index + 1).padStart(2, '0')}</span><b>{seed.label}</b><small>{seed.scenario}</small><i><ArrowUpRight size={16} /></i></button>)}</div>
      </section>

      <footer className="site-footer"><div className="footer-brand"><Fingerprint size={19} /> AI MYSTERY ROOM <span>/ FIELD SYSTEMS</span></div><nav className="footer-links" aria-label="Footer links"><a href="#method">ABOUT</a><button onClick={() => setLegalPage('contact')}>CONTACT</button><button onClick={() => setLegalPage('privacy')}>PRIVACY</button><button onClick={() => setLegalPage('terms')}>TERMS</button></nav><p>Fictional cases. Structured evidence. Your call.</p><span className="footer-status"><i /> ALL SYSTEMS NOMINAL</span></footer>

      <AnimatePresence>
        {authOpen && <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}>
          <motion.section className="auth-modal panel" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <div className="auth-head"><div className="brand-mark"><Fingerprint size={20} /></div><button className="icon-button" onClick={() => setAuthOpen(false)} aria-label="Close sign in"><X size={18} /></button></div>
            <span className="section-index">SECURE OPERATOR ACCESS</span><h2 id="auth-title">{authMode === 'login' ? 'Welcome back.' : 'Create your access.'}</h2><p className="auth-copy">Case files and investigation notes are saved to your operator account.</p>
            <form onSubmit={submitAuth} className="auth-form">
              {authMode === 'register' && <label>CALLSIGN<input name="username" required minLength="2" maxLength="32" placeholder="e.g. nightwatch" /></label>}
              <label>EMAIL ADDRESS<input name="email" type="email" required maxLength="160" placeholder="operator@example.com" /></label>
              <label>PASSPHRASE<input name="password" type="password" required minLength={authMode === 'register' ? 8 : 1} maxLength="128" placeholder={authMode === 'register' ? 'At least 8 characters' : 'Your password'} /></label>
              {authError && <div className="inline-error"><ShieldAlert size={15} /> {authError}</div>}
              <button className="primary-button form-submit" disabled={authBusy}>{authBusy ? 'VERIFYING CREDENTIALS…' : authMode === 'login' ? <>ENTER TERMINAL <ArrowRight size={16} /></> : <>CREATE ACCOUNT <ArrowRight size={16} /></>}</button>
            </form>
            <button className="auth-switch" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>{authMode === 'login' ? 'New to the room? Create an account.' : 'Already have access? Sign in.'}</button>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {legalPage && <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setLegalPage(''); }}><motion.section className="legal-modal panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} role="dialog" aria-modal="true"><div className="auth-head"><span className="section-index">FIELD SYSTEMS / {legalPage.toUpperCase()}</span><button className="icon-button" onClick={() => setLegalPage('')} aria-label="Close information"><X size={18} /></button></div><h2>{legalPage === 'privacy' ? 'Privacy, plainly.' : legalPage === 'terms' ? 'Terms of use.' : 'Contact the operator.'}</h2>{legalPage === 'privacy' ? <div className="legal-copy"><p>This app stores your email, username, password hash, cases, notes, and verdicts under your account. Passwords are hashed before storage.</p><p>When Gemini is configured, your scenario seed is sent to Google Gemini to generate the fictional case. Do not enter real personal, confidential, or sensitive information.</p><p>Without MongoDB, account and case data live in server memory and are lost when the server stops. With MongoDB, they remain in the configured database until removed by its operator.</p></div> : legalPage === 'terms' ? <div className="legal-copy"><p>AI Mystery Room is a fictional investigation experience. Generated people, events, records, and forensic exhibits are invented for gameplay and training.</p><p>Do not use the service to process real investigations or submit information you do not have permission to share. AI-generated stories can contain inconsistencies; use the evidence provided in the case to reach your verdict.</p></div> : <div className="legal-copy"><p>This self-hosted build does not have a support address configured. Add a contact address to the deployment before publishing it for other users.</p></div>}</motion.section></motion.div>}
      </AnimatePresence>
    </main>
  );
}
