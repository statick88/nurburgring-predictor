'use client';

interface LanguageToggleProps {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
}

export default function LanguageToggle({ language, setLanguage }: LanguageToggleProps) {
  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  // Mostrar el idioma al que se va a cambiar (inverso del actual)
  const nextLanguage = language === 'es' ? 'EN' : 'ES';

  return (
    <button
      onClick={toggleLanguage}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleLanguage()}
      aria-label={language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
      className="relative p-2 bg-racing-darker border border-racing-light/10 rounded-lg hover:bg-racing-dark hover:border-racing-red/30 transition-all duration-200 active:scale-95"
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className="text-sm font-bold text-white font-mono">
        {nextLanguage}
      </span>
    </button>
  );
}