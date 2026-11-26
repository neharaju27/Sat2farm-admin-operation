import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children, role }) => {
  const normalizedRole = String(role || '').trim().toLowerCase();

  const canChangeLanguage =
    normalizedRole === 'manager' || normalizedRole === 'partner';

  const [language, setLanguage] = useState('english');
  const [activeRole, setActiveRole] = useState('');

  // Load the language preference for the current role
  useEffect(() => {
    if (!canChangeLanguage) {
      setLanguage('english');
      setActiveRole(normalizedRole);
      return;
    }

    const savedLanguage =
      localStorage.getItem(`portal_language_${normalizedRole}`) || 'english';

    setLanguage(savedLanguage);
    setActiveRole(normalizedRole);
  }, [normalizedRole, canChangeLanguage]);

  // Save language separately for Manager and Partner
  useEffect(() => {
    if (!canChangeLanguage || activeRole !== normalizedRole) return;

    localStorage.setItem(
      `portal_language_${normalizedRole}`,
      language
    );
  }, [language, normalizedRole, activeRole, canChangeLanguage]);

  const handleLanguageChange = (newLanguage) => {
    if (!canChangeLanguage) return;

    if (newLanguage === 'english' || newLanguage === 'spanish') {
      setLanguage(newLanguage);
    }
  };

  const t = (key) => {
    return (
      translations[language]?.[key] ||
      translations.english?.[key] ||
      key
    );
  };

  const value = {
    language,
    setLanguage: handleLanguageChange,
    t,
    canChangeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
