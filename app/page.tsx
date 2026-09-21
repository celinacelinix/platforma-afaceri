'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type FormData = {
  tip_afacere: string;
  concept: string;
  localitate: string;
  tip_zona: string;
  buget: string;
  suprafata: string;
};

const initialForm: FormData = {
  tip_afacere: '',
  concept: '',
  localitate: '',
  tip_zona: '',
  buget: '',
  suprafata: '',
};

export default function LandingPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const router = useRouter();

  // Mini-simulator state
  const [simClienti, setSimClienti] = useState(80);
  const [simPret, setSimPret] = useState(45);
  const [simLocalitate, setSimLocalitate] = useState('București');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/dashboard?${params.toString()}`);
  }

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('formular');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const getTipAfacereHint = () => {
    switch (form.tip_afacere) {
      case 'restaurant': return 'Avem date reale de chirie și salarii pentru 8 orașe din România';
      case 'salon': return 'Date actualizate pentru saloane din orașe mici și mari';
      case 'constructii': return 'Configurare specifică pentru antreprenori în construcții';
      case 'magazin_online': return 'Costuri reale de logistică și marketing digital incluse';
      default: return '';
    }
  };

  const hint = getTipAfacereHint();

  return (
    <div className="landing-page" style={styles.page}>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .nav-right-text { display: none !important; }
          .hero-inner { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-section { padding: 100px 16px 48px !important; }
          .hero-title { fontSize: 2.25rem !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .aha-cards, .diff-cards, .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
          .footer-right { flex-direction: column; gap: 12px; }
          .mini-sim-inner { flex-direction: column !important; }
          .sim-col { width: 100% !important; border-right: none !important; border-bottom: 1px solid #e2e8f0; }
          .table-wrapper { overflow-x: auto; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.navLeft}>
            <Image src="/logo.png" alt="Logo" width={32} height={32} style={styles.logoImg} />
            <div style={styles.logoTextWrap}>
              <span style={styles.logoText}>planurideafaceri.ro</span>
              <span className="nav-right-text" style={styles.logoSubtext}>Simulator pentru ideile tale</span>
            </div>
          </div>
          <div style={styles.navRight}>
            <button onClick={() => router.push('/login')} className="nav-right-text" style={styles.loginBtn}>Intră în cont</button>
            <button onClick={scrollToForm} className="btn-accent" style={styles.startBtn}>Începe gratuit</button>
          </div>
        </div>
      </nav>

      {/* SOCIAL PROOF */}
      <div style={styles.socialProof}>
        🟢 247 antreprenori și-au testat ideea pe platforma noastră
      </div>

      {/* HERO SECTION */}
      <section className="hero-section" style={styles.heroSection}>
        <div className="hero-inner" style={styles.heroInner}>
          <div style={styles.heroContent}>
            <h1 className="hero-title" style={styles.heroTitle}>
              Află dacă ideea ta de afacere chiar va funcționa,<br />
              <span style={styles.heroTitleHighlight}>înainte să pierzi bani.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Mai mult decât un text generat automat. Un motor de calcul financiar real care îți spune exact de câți bani ai nevoie, când ajungi pe profit și chiar dacă ideea ta este sortită eșecului.
            </p>
          </div>

          <div id="formular" style={styles.heroFormCard}>
            <h2 style={styles.formTitle}>Spune-ne despre ideea ta:</h2>
            <form onSubmit={handleSubmit} noValidate className="form-grid" style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="tip_afacere">Tip afacere</label>
                <select id="tip_afacere" name="tip_afacere" value={form.tip_afacere}
                  onChange={handleChange} required style={styles.select}>
                  <option value="" disabled>Selectează tipul</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="salon">Salon</option>
                  <option value="constructii">Construcții</option>
                  <option value="magazin_online">Magazin online</option>
                </select>
                {hint && (
                  <p className="fade-in" style={styles.hintText}>{hint}</p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="concept">Concept <span style={styles.optional}>(opțional)</span></label>
                <input id="concept" name="concept" type="text" value={form.concept}
                  onChange={handleChange} placeholder="ex. Bistro italian" style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="localitate">Localitate</label>
                <input id="localitate" name="localitate" type="text" value={form.localitate}
                  onChange={handleChange} placeholder="ex. Cluj-Napoca" required style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="tip_zona">Tip zonă</label>
                <select id="tip_zona" name="tip_zona" value={form.tip_zona}
                  onChange={handleChange} required style={styles.select}>
                  <option value="" disabled>Selectează zona</option>
                  <option value="centru">Centru</option>
                  <option value="rezidential">Cartier rezidențial</option>
                  <option value="industrial">Zonă industrială</option>
                  <option value="periferie">Periferie</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="buget">Buget disponibil</label>
                <div style={styles.inputWrapper}>
                  <input id="buget" name="buget" type="number" value={form.buget}
                    onChange={handleChange} placeholder="ex. 150000" required min={0}
                    style={{ ...styles.input, ...styles.inputWithSuffix }} />
                  <span style={styles.suffix}>lei</span>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="suprafata">Suprafață <span style={styles.optional}>(opțional)</span></label>
                <div style={styles.inputWrapper}>
                  <input id="suprafata" name="suprafata" type="number" value={form.suprafata}
                    onChange={handleChange} placeholder="ex. 90" min={0}
                    style={{ ...styles.input, ...styles.inputWithSuffix }} />
                  <span style={styles.suffix}>mp</span>
                </div>
              </div>

              <div style={styles.formSubmitWrap}>
                <button type="submit" className="btn-accent" style={styles.submitBtn}>
                  Generează simularea →
                </button>
                <p style={styles.submitHint}>Completează în 30 de secunde.</p>
                <a href="#" style={styles.ytLink}>📺 Ai nevoie de ajutor? Vezi cum funcționează pe YouTube</a>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* MINI-SIMULATOR LIVE SECTION */}
      <section style={styles.simSection}>
        <div style={styles.simInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Joacă-te cu cifrele. Acesta e doar începutul.</h2>
          </div>
          
          <div style={styles.simCard}>
            <div className="mini-sim-inner" style={styles.simCardInner}>
              <div className="sim-col" style={styles.simControls}>
                <div style={styles.simControlGrp}>
                  <div style={styles.simControlHeader}>
                    <label style={styles.simLabel}>Clienți pe zi</label>
                    <span style={styles.simValue}>{simClienti} clienți/zi</span>
                  </div>
                  <input type="range" min={20} max={200} value={simClienti} 
                    onChange={e => setSimClienti(Number(e.target.value))} style={styles.simRange} />
                </div>

                <div style={styles.simControlGrp}>
                  <div style={styles.simControlHeader}>
                    <label style={styles.simLabel}>Preț mediu</label>
                    <span style={styles.simValue}>{simPret} lei</span>
                  </div>
                  <input type="range" min={20} max={150} value={simPret} 
                    onChange={e => setSimPret(Number(e.target.value))} style={styles.simRange} />
                </div>

                <div style={styles.simControlGrp}>
                  <label style={styles.simLabel}>Localitate</label>
                  <select value={simLocalitate} onChange={e => setSimLocalitate(e.target.value)} style={styles.select}>
                    <option value="București">București</option>
                    <option value="Cluj-Napoca">Cluj-Napoca</option>
                    <option value="Iași">Iași</option>
                    <option value="Timișoara">Timișoara</option>
                    <option value="Brașov">Brașov</option>
                  </select>
                </div>
              </div>

              <div className="sim-col" style={styles.simResults}>
                <div style={styles.simVisibleCard}>
                  <div style={styles.simResLabel}>Venit lunar estimat</div>
                  <div style={styles.simResValue}>{(simClienti * simPret * 28).toLocaleString('ro-RO')} lei</div>
                  <div style={styles.simResNote}>bazat pe 28 zile lucrătoare</div>
                </div>

                <div style={styles.simBlurredWrap}>
                  <div style={styles.simBlurredCard}>
                    <div style={styles.simResLabel}>Profit net lunar</div>
                    <div style={styles.simResValue}>*** lei</div>
                  </div>
                  <div style={styles.simBlurredCard}>
                    <div style={styles.simResLabel}>Luna de breakeven</div>
                    <div style={styles.simResValue}>Luna **</div>
                  </div>
                  <div style={styles.simBlurredCard}>
                    <div style={styles.simResLabel}>Cash minim necesar</div>
                    <div style={styles.simResValue}>*** lei</div>
                  </div>
                  <div style={styles.simOverlay}>
                    <span style={styles.simOverlayText}>🔒 Disponibil după deblocare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.simActionWrap}>
            <button onClick={scrollToForm} className="btn-accent" style={styles.simBtn}>
              Vezi toate cifrele — 149 lei →
            </button>
            <p style={styles.simActionHint}>
              Completează datele reale ale afacerii tale și obține verdictul complet
            </p>
          </div>
        </div>
      </section>

      {/* DE CE SUNTEM DIFERITI */}
      <section style={styles.diffSection}>
        <div style={styles.diffInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>De ce generatoarele obișnuite de planuri de afaceri te pot duce la faliment.</h2>
            <p style={styles.sectionSubtitle}>Planurile de afaceri generice îți validează ideea indiferent de realitate. Noi îți dăm un verdict — și uneori verdictul e că nu merită.</p>
          </div>
          
          <div className="diff-cards" style={styles.diffCards}>
            <div style={styles.diffCard}>
              <div style={styles.diffIcon}>📊</div>
              <h3 style={styles.diffCardTitle}>Cifre verificabile, nu povești generate</h3>
              <p style={styles.diffCardText}>La noi, textul narativ e generat automat. Tot ce înseamnă calcule, cash-flow și evaluări de risc este procesat de un motor matematic determinist. Aceeași configurație va da mereu același verdict.</p>
            </div>
            <div style={styles.diffCard}>
              <div style={styles.diffIcon}>🛑</div>
              <h3 style={styles.diffCardTitle}>Îți spunem direct când NU merge</h3>
              <p style={styles.diffCardText}>Dacă ai nevoie de 150 de clienți pe zi pentru a fi pe profit, dar spațiul tău are doar 40 mp, sistemul emite o alertă blocantă: &apos;Fizic imposibil&apos;. Nu îți validăm orbește ideea.</p>
            </div>
            <div style={styles.diffCard}>
              <div style={styles.diffIcon}>🛡️</div>
              <h3 style={styles.diffCardTitle}>Plan de Exit Inclus</h3>
              <p style={styles.diffCardText}>Suntem singurii care îți calculăm din start ce pierzi dacă afacerea nu merge — preavize, stocuri, lichidări. Arătăm cum să ieși cu pierderi minime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCTIONALITATI */}
      <section style={styles.featSection}>
        <div style={styles.featInner}>
          <h2 style={styles.sectionTitle}>Ce primești când deblochezi planul complet</h2>
          <div style={styles.featList}>
            <div style={styles.featItem}>
              <div style={styles.featCheck}>✅</div>
              <div>
                <h4 style={styles.featItemTitle}>10 Capitole Detaliate</h4>
                <p style={styles.featItemText}>De la analiza concurenței și plan operațional, la marketing și financiar.</p>
              </div>
            </div>
            <div style={styles.featItem}>
              <div style={styles.featCheck}>✅</div>
              <div>
                <h4 style={styles.featItemTitle}>Cash-flow pe 24 de luni</h4>
                <p style={styles.featItemText}>Calcule exacte care țin cont de stocuri blocate, decalaje de plată și rampa de start a vânzărilor.</p>
              </div>
            </div>
            <div style={styles.featItem}>
              <div style={styles.featCheck}>✅</div>
              <div>
                <h4 style={styles.featItemTitle}>Mecanica de Misiuni</h4>
                <p style={styles.featItemText}>Nu știi chiria pe mp? Îți dăm o misiune rapidă (ex: sună la 3 agenții — 15 minute). Completezi și crești Scorul de Încredere al planului.</p>
              </div>
            </div>
            <div style={styles.featItem}>
              <div style={styles.featCheck}>✅</div>
              <div>
                <h4 style={styles.featItemTitle}>Analiză de Sensibilitate</h4>
                <p style={styles.featItemText}>Afli imediat care sunt cele mai critice puncte. &apos;O scădere de 10% a numărului de clienți îți taie 52% din profit.&apos;</p>
              </div>
            </div>
            <div style={styles.featItem}>
              <div style={styles.featCheck}>✅</div>
              <div>
                <h4 style={styles.featItemTitle}>Export PDF</h4>
                <p style={styles.featItemText}>Descarci planul gata de prezentat pentru finanțare.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIE VIZUALA */}
      <section style={styles.compSection}>
        <div style={styles.compInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>planurideafaceri.ro vs. un plan clasic</h2>
            <p style={styles.sectionSubtitle}>De ce plătești 149 lei în loc de 2.000+ lei</p>
          </div>
          
          <div className="table-wrapper">
            <table style={styles.compTable}>
              <thead>
                <tr>
                  <th style={styles.compThEmpty}>Criteriu</th>
                  <th style={styles.compThUs}>planurideafaceri.ro</th>
                  <th style={styles.compThThem}>Consultant clasic</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.compTr}>
                  <td style={styles.compTdLeft}>Timp necesar</td>
                  <td style={styles.compTdCenter}>30 minute</td>
                  <td style={styles.compTdCenter}>2-4 săptămâni</td>
                </tr>
                <tr style={styles.compTrAlt}>
                  <td style={styles.compTdLeft}>Cost</td>
                  <td style={styles.compTdCenter}>149 lei</td>
                  <td style={styles.compTdCenter}>1.500 - 5.000 lei</td>
                </tr>
                <tr style={styles.compTr}>
                  <td style={styles.compTdLeft}>Cifre personalizate</td>
                  <td style={styles.compTdCenter}><span style={styles.iconOk}>✅</span> Pe orașul tău</td>
                  <td style={styles.compTdCenter}><span style={styles.iconWarn}>⚠️</span> Generice</td>
                </tr>
                <tr style={styles.compTrAlt}>
                  <td style={styles.compTdLeft}>Modifici oricând</td>
                  <td style={styles.compTdCenter}><span style={styles.iconOk}>✅</span> Nelimitat</td>
                  <td style={styles.compTdCenter}><span style={styles.iconErr}>❌</span> Plătești extra</td>
                </tr>
                <tr style={styles.compTr}>
                  <td style={styles.compTdLeft}>Plan de exit inclus</td>
                  <td style={styles.compTdCenter}><span style={styles.iconOk}>✅</span> Automat</td>
                  <td style={styles.compTdCenter}><span style={styles.iconErr}>❌</span> Rar inclus</td>
                </tr>
                <tr style={styles.compTrAlt}>
                  <td style={styles.compTdLeft}>Verdict de risc</td>
                  <td style={styles.compTdCenter}><span style={styles.iconOk}>✅</span> Matematic</td>
                  <td style={styles.compTdCenter}><span style={styles.iconWarn}>⚠️</span> Subiectiv</td>
                </tr>
                <tr style={styles.compTr}>
                  <td style={styles.compTdLeft}>Disponibil acum</td>
                  <td style={styles.compTdCenter}><span style={styles.iconOk}>✅</span> Instant</td>
                  <td style={styles.compTdCenter}><span style={styles.iconErr}>❌</span> Programare</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PREȚURI */}
      <section style={styles.pricingSection}>
        <div style={styles.pricingInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Alege varianta potrivită pentru tine</h2>
            <p style={styles.sectionSubtitle}>Fără abonamente. Plătești doar pentru ce testezi.</p>
          </div>
          
          <div className="pricing-grid" style={styles.pricingGrid}>
            <div style={{ ...styles.pricingCard, ...styles.pricingCardPopular }}>
              <div style={styles.pricingBadge}>Cel mai popular</div>
              <h3 style={styles.pricingCardTitle}>START</h3>
              <div style={styles.pricingPrice}>149 Lei</div>
              <div style={styles.pricingSubprice}>plată unică</div>
              <ul style={styles.pricingList}>
                <li>Deblocare 1 domeniu de activitate</li>
                <li>Simulări financiare nelimitate</li>
                <li>10 acțiuni AI de generare capitole</li>
                <li>Export PDF nelimitat</li>
                <li>Cash-flow 24 luni + analiză risc</li>
                <li>Misiuni de validare cu date reale</li>
              </ul>
              <button onClick={scrollToForm} className="btn-accent" style={styles.pricingBtnFull}>Începe cu primul tău proiect →</button>
            </div>

            <div style={styles.pricingCard}>
              <div style={styles.pricingBadgeAlt}>Add-on</div>
              <h3 style={styles.pricingCardTitle}>EXTRA</h3>
              <div style={styles.pricingPrice}>99 Lei <span style={styles.pricingPerDomain}>/ domeniu</span></div>
              <div style={styles.pricingSubprice}>necesită Pachetul Start</div>
              <ul style={styles.pricingList}>
                <li>Domeniu suplimentar de activitate</li>
                <li>Compară 2 idei de afaceri diferite</li>
                <li>Toate beneficiile Start pentru domeniul nou</li>
              </ul>
              <button onClick={scrollToForm} style={styles.pricingBtnOutline}>Adaugă un domeniu nou →</button>
            </div>

            <div style={styles.pricingCard}>
              <div style={styles.pricingBadgeAlt}>Antreprenori în serie</div>
              <h3 style={styles.pricingCardTitle}>BULK / PRO</h3>
              <div style={styles.pricingPrice}>299 Lei</div>
              <div style={styles.pricingSubprice}>plată unică</div>
              <ul style={styles.pricingList}>
                <li>4 domenii de activitate simultan</li>
                <li>Toate beneficiile Start × 4</li>
                <li>Ideal pentru comparații multiple</li>
              </ul>
              <button onClick={scrollToForm} style={styles.pricingBtnOutline}>Deblochează pachetul complet →</button>
            </div>

            <div style={styles.pricingCard}>
              <div style={styles.pricingBadgeAlt}>Nișă</div>
              <h3 style={styles.pricingCardTitle}>CUSTOM</h3>
              <div style={styles.pricingPrice}>89 Lei</div>
              <div style={styles.pricingSubprice}>plată unică</div>
              <ul style={styles.pricingList}>
                <li>Pentru afaceri atipice sau de nișă</li>
                <li>Motor de calcul complet</li>
                <li>10 capitole narative</li>
                <li>Completezi manual datele financiare</li>
                <li>Fără date de piață preîncărcate</li>
              </ul>
              <button onClick={scrollToForm} style={styles.pricingBtnOutline}>Creează o afacere custom →</button>
            </div>
          </div>
          
          <p style={styles.pricingNote}>
            Toate prețurile includ TVA. Plata se procesează securizat prin LemonSqueezy.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={styles.ctaFinalSection}>
        <div style={styles.ctaFinalInner}>
          <h2 style={styles.ctaFinalTitle}>Un plan de afaceri greșit te poate costa zeci de mii de euro.</h2>
          <h3 style={styles.ctaFinalSubtitle}>Verificarea lui te costă doar 149 Lei.</h3>
          <p style={styles.ctaFinalText}>
            Transformă o simplă estimare oarecare într-un verdict matematic pe care poți paria banii tăi.
          </p>
          <button onClick={scrollToForm} style={styles.ctaFinalBtn}>Testează ideea ta acum →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div className="footer-inner" style={styles.footerInner}>
          <div style={styles.footerLeft}>
            <div style={styles.footerLogoWrap}>
              <Image src="/logo.png" alt="Logo" width={24} height={24} style={styles.logoImg} />
              <span style={styles.footerLogoText}>planurideafaceri.ro</span>
            </div>
            <p style={styles.footerCopyright}>© 2026 Toate drepturile rezervate.</p>
          </div>
          <div className="footer-right" style={styles.footerRight}>
            <a href="#" style={styles.footerLink}>Termeni și condiții</a>
            <a href="#" style={styles.footerLink}>Politică de confidențialitate</a>
            <a href="#" style={styles.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: '#ffffff',
    color: '#1a1a2e',
    fontFamily: 'inherit',
    overflowX: 'hidden'
  },
  /* NAVBAR */
  navbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 1000,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
  },
  navInner: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoImg: {
    borderRadius: '4px'
  },
  logoTextWrap: {
    display: 'flex',
    flexDirection: 'column'
  },
  logoText: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#0f766e',
    lineHeight: 1
  },
  logoSubtext: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '4px'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  loginBtn: {
    background: 'none',
    border: 'none',
    color: '#374151',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: '8px 12px'
  },
  startBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.95rem',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
  },
  socialProof: {
    marginTop: '70px',
    backgroundColor: '#f0fdf4',
    textAlign: 'center',
    padding: '8px 16px',
    fontSize: '0.85rem',
    color: '#4b5563',
    fontWeight: 500
  },
  /* HERO */
  heroSection: {
    padding: '80px 24px 80px',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f0fdfa 100%)',
    minHeight: 'calc(100vh - 70px - 34px)',
    display: 'flex',
    alignItems: 'center'
  },
  heroInner: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'center'
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: '#1a1a2e',
    margin: 0
  },
  heroTitleHighlight: {
    color: '#0f766e'
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    color: '#4b5563',
    maxWidth: '540px',
    margin: 0
  },
  heroFormCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)',
    animation: 'fadeInUp 0.6s ease-out forwards'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '24px',
    color: '#111827',
    margin: '0 0 24px 0'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151'
  },
  optional: {
    color: '#9ca3af',
    fontWeight: 400
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    backgroundColor: '#fff'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputWithSuffix: {
    paddingRight: '48px'
  },
  suffix: {
    position: 'absolute',
    right: '12px',
    color: '#6b7280',
    fontSize: '0.9375rem',
    pointerEvents: 'none'
  },
  hintText: {
    fontSize: '0.75rem',
    color: '#0f766e',
    margin: '2px 0 0 0',
    fontWeight: 500
  },
  formSubmitWrap: {
    gridColumn: '1 / -1',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '1.05rem',
    border: 'none',
    cursor: 'pointer',
    color: 'white'
  },
  submitHint: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    margin: 0
  },
  ytLink: {
    fontSize: '0.875rem',
    color: '#0f766e',
    textDecoration: 'none',
    fontWeight: 500,
    marginTop: '8px'
  },
  /* SIMULATOR LIVE */
  simSection: {
    padding: '80px 24px',
    backgroundColor: '#ffffff'
  },
  simInner: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  simCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '32px'
  },
  simCardInner: {
    display: 'flex',
    flexDirection: 'row',
  },
  simControls: {
    width: '45%',
    padding: '32px',
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  simControlGrp: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  simControlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  simLabel: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#374151'
  },
  simValue: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#0f766e'
  },
  simRange: {
    width: '100%',
    accentColor: '#0f766e'
  },
  simResults: {
    width: '55%',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  simVisibleCard: {
    backgroundColor: '#f0fdfa',
    border: '1px solid #ccfbf1',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  },
  simResLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
  },
  simResValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '4px'
  },
  simResNote: {
    fontSize: '0.75rem',
    color: '#0f766e',
    fontWeight: 500
  },
  simBlurredWrap: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  simBlurredCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    filter: 'blur(6px)'
  },
  simOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    zIndex: 10
  },
  simOverlayText: {
    backgroundColor: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1f2937',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  simActionWrap: {
    textAlign: 'center'
  },
  simBtn: {
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '1.05rem',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    boxShadow: '0 4px 6px rgba(15,118,110,0.2)'
  },
  simActionHint: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '12px'
  },
  /* DE CE SUNTEM DIFERITI */
  diffSection: {
    padding: '100px 24px',
    backgroundColor: '#f8fffe'
  },
  diffInner: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionHeader: {
    marginBottom: '48px',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    margin: '0 0 16px 0'
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    color: '#4b5563',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6
  },
  diffCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px'
  },
  diffCard: {
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #f0fdfa'
  },
  diffIcon: {
    fontSize: '2.5rem',
    marginBottom: '20px'
  },
  diffCardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  diffCardText: {
    fontSize: '0.95rem',
    color: '#4b5563',
    lineHeight: 1.6,
    margin: 0
  },
  /* FUNCTIONALITATI */
  featSection: {
    padding: '100px 24px',
    backgroundColor: '#ffffff'
  },
  featInner: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  featList: {
    marginTop: '48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  featItem: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  },
  featCheck: {
    fontSize: '1.5rem',
    flexShrink: 0,
    marginTop: '2px'
  },
  featItemTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  featItemText: {
    fontSize: '1rem',
    color: '#4b5563',
    lineHeight: 1.5,
    margin: 0
  },
  /* COMPARATIE VIZUALA */
  compSection: {
    padding: '80px 24px',
    backgroundColor: '#ffffff'
  },
  compInner: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  compTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  compThEmpty: {
    padding: '16px',
    borderBottom: '2px solid #e5e7eb',
    textAlign: 'left'
  },
  compThUs: {
    padding: '16px',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    fontWeight: 700,
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    width: '30%'
  },
  compThThem: {
    padding: '16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: 700,
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    width: '30%'
  },
  compTr: {
    backgroundColor: '#ffffff'
  },
  compTrAlt: {
    backgroundColor: '#f9fafb'
  },
  compTdLeft: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    color: '#111827'
  },
  compTdCenter: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'center',
    color: '#4b5563'
  },
  iconOk: { color: '#10b981', marginRight: '4px' },
  iconErr: { color: '#ef4444', marginRight: '4px' },
  iconWarn: { color: '#f59e0b', marginRight: '4px' },
  /* PREȚURI */
  pricingSection: {
    padding: '100px 24px',
    backgroundColor: '#f8fafc'
  },
  pricingInner: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    marginTop: '48px',
    alignItems: 'start'
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px 24px',
    border: '1px solid #e2e8f0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  pricingCardPopular: {
    border: '2px solid #0f766e',
    boxShadow: '0 10px 25px -5px rgba(15,118,110,0.1)'
  },
  pricingBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0f766e',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  pricingBadgeAlt: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  pricingCardTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  pricingPrice: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1
  },
  pricingPerDomain: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: 500
  },
  pricingSubprice: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '8px',
    marginBottom: '24px'
  },
  pricingList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 32px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    fontSize: '0.9375rem',
    color: '#4b5563'
  },
  pricingBtnFull: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 600,
    border: 'none',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: 'white'
  },
  pricingBtnOutline: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 600,
    backgroundColor: 'transparent',
    border: '1px solid #0f766e',
    color: '#0f766e',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  pricingNote: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '40px'
  },
  /* CTA FINAL */
  ctaFinalSection: {
    padding: '100px 24px',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    textAlign: 'center'
  },
  ctaFinalInner: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  ctaFinalTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    margin: '0 0 16px 0'
  },
  ctaFinalSubtitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#ccfbf1',
    marginBottom: '24px',
    margin: '0 0 24px 0'
  },
  ctaFinalText: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    color: '#f0fdfa',
    marginBottom: '40px',
    maxWidth: '600px',
    margin: '0 0 40px 0'
  },
  ctaFinalBtn: {
    backgroundColor: '#ffffff',
    color: '#0f766e',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '1.125rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  /* FOOTER */
  footer: {
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    padding: '48px 24px'
  },
  footerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '32px'
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footerLogoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  footerLogoText: {
    fontSize: '1.25rem',
    fontWeight: 700
  },
  footerCopyright: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    margin: 0
  },
  footerRight: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  footerLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.9375rem',
    transition: 'color 0.2s'
  }
};
