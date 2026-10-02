import React, { useState } from 'react';

export const CtaBanner: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [buttonText, setButtonText] = useState('Get a free call back →');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setButtonText('✓ Thanks! We will WhatsApp you shortly');

    // Simulate submission delay
    setTimeout(() => {
      setName('');
      setPhone('');
      setButtonText('Get a free call back →');
      setIsSubmitting(false);
    }, 3000);
  };

  return (
    <>
      <style>{`
        /* Font imports */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        /* CSS Variables */
        .cta-banner-root {
          --bg: #07180a;
          --bg-2: #0c1110;
          --bg-3: #111815;
          --line: rgba(255,255,255,0.08);
          --line-2: rgba(255,255,255,0.14);
          --fg: #e8eee9;
          --fg-dim: #9fa8a1;
          --fg-mute: #6c7670;
          --green: #4ade80;
          --emerald: #059669;
          --green-glow: rgba(74,222,128,0.18);
          --grad: linear-gradient(135deg, #4ade80 0%, #059669 100%);
          --grad-soft: linear-gradient(135deg, rgba(74,222,128,0.12), rgba(5,150,105,0.05));
        }

        .cta-banner-root {
          position: relative;
          overflow: hidden;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          background: linear-gradient(135deg, rgba(2, 36, 14, 0.4), rgba(5,150,105,0.03));
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--fg);
        }

        .cta-banner-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(50% 120% at 80% 50%, rgba(2, 56, 22, 0.77), transparent 60%);
          pointer-events: none;
        }

        .cta-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: center;
          padding-top: 50px;
          padding-bottom: 50px;
        }

        .cta-content h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: clamp(26px, 3.2vw, 38px);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--fg);
        }

        .cta-content p {
          color: var(--fg-dim);
          font-size: 15px;
          margin: 12px 0 0;
          max-width: 460px;
          line-height: 1.5;
        }

        /* Lite lead form (inline, compact) */
  .lite-form { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 30px; padding: 14px; border: 1px solid var(--line-2); border-radius: 16px; background: rgba(255,255,255,0.025); max-width: 560px; }
  .lite-form input, .lite-form select { flex: 1 1 150px; min-width: 0; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--line-2); border-radius: 10px; color: var(--fg); font-family: 'Inter'; font-size: 14px; transition: border-color .15s ease; }
  .lite-form input:focus, .lite-form select:focus { outline: none; border-color: var(--green); }
  .lite-form select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239fa8a1' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .lite-form button { flex: 1 1 100%; padding: 13px; border-radius: 10px; border: none; }
  .lite-form .lite-note { flex: 1 1 100%; font-size: 11.5px; color: var(--fg-mute); text-align: center; margin-top: -2px; }


        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid transparent;
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
          white-space: nowrap;
          background: var(--green);
          color: #04130a;
          box-shadow: 0 0 0 0 rgba(74,222,128,0.5), 0 10px 40px -10px rgba(74,222,128,0.55);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 6px rgba(74,222,128,0.12), 0 14px 50px -10px rgba(74,222,128,0.7);
        }

        .btn-primary .arrow {
          transition: transform 0.2s ease;
          display: inline-block;
        }

        .btn-primary:hover .arrow {
          transform: translateX(3px);
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .cta-wrap {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-top: 40px;
            padding-bottom: 40px;
          }

          .cta-content p {
            max-width: 100%;
          }

          .lite-form {
            width: 100%;
          }

          .lite-form input {
            flex: 1 1 100%;
          }

          .btn-primary {
            flex: 1 1 100%;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .cta-wrap {
            padding: 0 20px;
            padding-top: 36px;
            padding-bottom: 36px;
          }

          .lite-form {
            flex-direction: column;
            gap: 12px;
          }

          .lite-form input {
            width: 100%;
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="cta-banner-root">
        <div className="cta-wrap">
          <div className="cta-content">
            <h3>Not sure which track fits you?</h3>
            <p>
              Drop your details — we'll call you, understand your background, and map the fastest path
              to a high-paying role. Free, no pressure.
            </p>
          </div>

          <form className="lite-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <input
              type="tel"
              name="phone"
              placeholder="WhatsApp number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {buttonText}
              {!isSubmitting && <span className="arrow">→</span>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
