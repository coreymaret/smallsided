import styles from "./LanguageToggle.module.scss";
import { useLanguage } from "../../contexts/LanguageContext";

// ── Flag SVGs ─────────────────────────────────────────────────

const USFlag = ({ size }: { size: number }) => (
  <svg
    viewBox="0 0 60 40"
    width={size}
    height={(size * 40) / 60}
    style={{ display: "block", borderRadius: 2, flexShrink: 0 }}
    aria-hidden="true"
  >
    {[...Array(13)].map((_, i) => (
      <rect
        key={i}
        x="0"
        y={i * (40 / 13)}
        width="60"
        height={40 / 13}
        fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}
      />
    ))}
    <rect x="0" y="0" width="24" height={(40 * 7) / 13} fill="#3C3B6E" />
    {(() => {
      const stars = [];
      const cantonH = (40 * 7) / 13;
      for (let row = 0; row < 9; row++) {
        const cols = row % 2 === 0 ? 6 : 5;
        const xStart = row % 2 === 0 ? 2 : 4.4;
        for (let col = 0; col < cols; col++) {
          stars.push(
            <text
              key={`${row}-${col}`}
              x={xStart + col * 4}
              y={cantonH * (row + 0.7) / 9}
              fontSize="3"
              fill="white"
              textAnchor="middle"
            >
              ★
            </text>
          );
        }
      }
      return stars;
    })()}
  </svg>
);

const MXFlag = ({ size }: { size: number }) => (
  <svg
    viewBox="0 0 60 40"
    width={size}
    height={(size * 40) / 60}
    style={{ display: "block", borderRadius: 2, flexShrink: 0 }}
    aria-hidden="true"
  >
    <rect x="0"  y="0" width="20" height="40" fill="#006847" />
    <rect x="20" y="0" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" y="0" width="20" height="40" fill="#CE1126" />
    <g transform="translate(30,20)">
      <ellipse cx="0" cy="2"  rx="4" ry="5"   fill="#8B6914" opacity="0.7" />
      <circle  cx="0" cy="-3" r="2.5"          fill="#5C4A00" opacity="0.8" />
      <path d="M-5,0 Q-8,-4 -5,-7 Q-2,-4 -2,-1Z" fill="#5C4A00" opacity="0.7" />
      <path d="M5,0 Q8,-4 5,-7 Q2,-4 2,-1Z"       fill="#5C4A00" opacity="0.7" />
      <ellipse cx="0" cy="6"  rx="5" ry="2.5"  fill="#2D7A2D" opacity="0.8" />
    </g>
  </svg>
);

// ── Shared pill internals ─────────────────────────────────────

interface SideProps {
  lang: "en" | "es";
  label: string;
  active: boolean;
  flagSize: number;
  sideWidth: number;
  sideHeight: number;
}

const Side = ({ lang, label, active, flagSize, sideWidth, sideHeight }: SideProps) => (
  <div
    className={`${styles.side} ${!active ? styles.inactive : ""}`}
    style={{ width: sideWidth, height: sideHeight }}
  >
    <div className={styles.sideInner}>
      {lang === "en" ? <USFlag size={flagSize} /> : <MXFlag size={flagSize} />}
      <span className={`${styles.label} ${active ? styles.labelActive : styles.labelInactive}`}>
        {label}
      </span>
    </div>
  </div>
);

// ── Desktop toggle ────────────────────────────────────────────

export const DesktopLanguageToggle = () => {
  const { isSpanish, toggleLanguage } = useLanguage();

  return (
    <div
      className={`${styles.pill} ${styles.desktop}`}
      onClick={toggleLanguage}
      role="button"
      aria-label={isSpanish ? "Switch to English" : "Cambiar a Español"}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleLanguage()}
    >
      <div
        className={styles.thumb}
        style={{
          width: 46,
          height: 30,
          left: isSpanish ? "calc(100% - 50px)" : "4px",
        }}
      />
      <Side lang="en" label="EN" active={!isSpanish} flagSize={20} sideWidth={46} sideHeight={30} />
      <Side lang="es" label="ES" active={isSpanish}  flagSize={20} sideWidth={46} sideHeight={30} />
    </div>
  );
};

// ── Mobile toggle ─────────────────────────────────────────────

interface MobileLanguageToggleProps {
  menuIsOpen: boolean;
}

export const MobileLanguageToggle = ({ menuIsOpen }: MobileLanguageToggleProps) => {
  const { isSpanish, toggleLanguage } = useLanguage();

  return (
    <div className={`${styles.mobileWrapper} ${menuIsOpen ? styles.visible : ""}`}>
      <p className={styles.mobileLabel}>Language / Idioma</p>
      <div
        className={`${styles.pill} ${styles.mobile}`}
        onClick={toggleLanguage}
        role="button"
        aria-label={isSpanish ? "Switch to English" : "Cambiar a Español"}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleLanguage()}
      >
        <div
          className={styles.thumb}
          style={{
            width: 72,
            height: 40,
            left: isSpanish ? "calc(100% - 78px)" : "6px",
          }}
        />
        <Side lang="en" label="EN" active={!isSpanish} flagSize={28} sideWidth={72} sideHeight={40} />
        <Side lang="es" label="ES" active={isSpanish}  flagSize={28} sideWidth={72} sideHeight={40} />
      </div>
    </div>
  );
};