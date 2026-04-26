import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

const themes = {
  light: { name: 'Light', bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', accent: 'bg-blue-500', gradient: 'from-blue-400 to-purple-500', border: 'border-gray-200' },
  dark: { name: 'Dark', bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', accent: 'bg-purple-600', gradient: 'from-purple-600 to-pink-600', border: 'border-gray-700' },
  red: { name: 'Red Pink', bg: 'bg-red-50', card: 'bg-white', text: 'text-red-900', accent: 'bg-red-500', gradient: 'from-red-400 to-pink-500', border: 'border-red-200' },
  blue: { name: 'Blue', bg: 'bg-blue-50', card: 'bg-white', text: 'text-blue-900', accent: 'bg-blue-500', gradient: 'from-blue-400 to-cyan-500', border: 'border-blue-200' },
  green: { name: 'Green', bg: 'bg-green-50', card: 'bg-white', text: 'text-green-900', accent: 'bg-green-500', gradient: 'from-green-400 to-emerald-500', border: 'border-green-200' },
  yellow: { name: 'Yellow', bg: 'bg-yellow-50', card: 'bg-white', text: 'text-yellow-900', accent: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500', border: 'border-yellow-200' },
  floral: { name: 'Floral', bg: 'bg-pink-50', card: 'bg-white/90', text: 'text-pink-900', accent: 'bg-pink-500', gradient: 'from-pink-300 to-rose-400', border: 'border-pink-200' },
  brown: { name: 'Brown', bg: 'bg-amber-50', card: 'bg-white', text: 'text-amber-900', accent: 'bg-amber-700', gradient: 'from-amber-600 to-orange-700', border: 'border-amber-200' },
  aqua: { name: 'Aqua', bg: 'bg-cyan-50', card: 'bg-white', text: 'text-cyan-900', accent: 'bg-cyan-500', gradient: 'from-cyan-400 to-teal-500', border: 'border-cyan-200' },
  cleangirl: { name: 'Clean Girl', bg: 'bg-stone-50', card: 'bg-white', text: 'text-stone-800', accent: 'bg-stone-400', gradient: 'from-stone-300 to-neutral-400', border: 'border-stone-200' },
  purple: { name: 'Purple', bg: 'bg-purple-50', card: 'bg-white', text: 'text-purple-900', accent: 'bg-purple-500', gradient: 'from-purple-400 to-violet-500', border: 'border-purple-200' },
  orange: { name: 'Orange', bg: 'bg-orange-50', card: 'bg-white', text: 'text-orange-900', accent: 'bg-orange-500', gradient: 'from-orange-400 to-red-500', border: 'border-orange-200' },
  mint: { name: 'Mint', bg: 'bg-emerald-50', card: 'bg-white', text: 'text-emerald-900', accent: 'bg-emerald-500', gradient: 'from-emerald-400 to-teal-500', border: 'border-emerald-200' },
  lavender: { name: 'Lavender', bg: 'bg-violet-50', card: 'bg-white', text: 'text-violet-900', accent: 'bg-violet-500', gradient: 'from-violet-400 to-purple-500', border: 'border-violet-200' },
  sunset: { name: 'Sunset', bg: 'bg-orange-50', card: 'bg-white/90', text: 'text-orange-900', accent: 'bg-orange-500', gradient: 'from-orange-400 to-pink-500', border: 'border-orange-200' },
  ocean: { name: 'Ocean', bg: 'bg-blue-50', card: 'bg-white/90', text: 'text-blue-900', accent: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-200' },
  forest: { name: 'Forest', bg: 'bg-lime-50', card: 'bg-white', text: 'text-lime-900', accent: 'bg-lime-600', gradient: 'from-lime-500 to-green-600', border: 'border-lime-200' },
  rose: { name: 'Rose', bg: 'bg-rose-50', card: 'bg-white', text: 'text-rose-900', accent: 'bg-rose-500', gradient: 'from-rose-400 to-pink-500', border: 'border-rose-200' },
  midnight: { name: 'Midnight', bg: 'bg-indigo-950', card: 'bg-indigo-900', text: 'text-indigo-100', accent: 'bg-indigo-500', gradient: 'from-indigo-600 to-purple-700', border: 'border-indigo-800' },
  coffee: { name: 'Coffee', bg: 'bg-amber-900', card: 'bg-amber-800', text: 'text-amber-100', accent: 'bg-amber-600', gradient: 'from-amber-700 to-orange-800', border: 'border-amber-700' },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    axios.get('http://localhost:8000/api/theme')
      .then(res => setCurrentTheme(res.data.theme))
      .catch(() => console.log('Using default theme'));
  }, []);

  const setTheme = async (themeName) => {
    setCurrentTheme(themeName);
    await axios.post('http://localhost:8000/api/theme', null, { params: { theme_name: themeName } });
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[currentTheme], setTheme, currentTheme, allThemes: Object.keys(themes) }}>
      <div className={`${themes[currentTheme].bg} ${themes[currentTheme].text} min-h-screen transition-all duration-500`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);