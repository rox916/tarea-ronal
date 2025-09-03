import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Intenta obtener la preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('darkMode');
    // Si existe una preferencia guardada, úsala; de lo contrario, verifica la preferencia del sistema
    return savedTheme !== null 
      ? JSON.parse(savedTheme) 
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Efecto para aplicar la clase al elemento html cuando cambia el modo
  useEffect(() => {
    // Guarda la preferencia en localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Aplica la clase al elemento html
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Función para cambiar entre modos
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};