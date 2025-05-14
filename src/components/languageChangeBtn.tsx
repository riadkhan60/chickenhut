'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LanguageChangeBtn() {
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('MYNEXTAPP_LOCALE='))
      ?.split('=')[1];
    if (cookieLocale) {
      setLanguage(cookieLocale);
    }
    if (!cookieLocale) {
      const browserLocale = navigator.language.slice(0, 2);
      setLanguage(browserLocale);
      document.cookie = `MYNEXTAPP_LOCALE=${browserLocale}`;
      router.refresh();
    }
  }, [router]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    document.cookie = `MYNEXTAPP_LOCALE=${lang}`;
    router.refresh();
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-gray-700 transition-colors duration-200 ${
          language === 'en'
            ? 'bg-blue-500 text-white border-blue-500 shadow-md'
            : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
        }`}
        aria-label="Select English"
        disabled={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('bn')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-gray-700 transition-colors duration-200 ${
          language === 'bn'
            ? 'bg-blue-500 text-white border-blue-500 shadow-md'
            : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
        }`}
        aria-label="Select Bengali"
        disabled={language === 'bn'}
      >
       বাংলা
      </button>
    </div>
  );
}

export default LanguageChangeBtn;
