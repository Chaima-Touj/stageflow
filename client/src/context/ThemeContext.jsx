import React, { createContext, useState, useEffect } from "react";// Importer les fonctions et objets nécessaires depuis React pour créer un contexte de thème, gérer l'état du thème et les effets de bord liés au thème, ainsi que les fonctions pour stocker le thème dans le stockage local du navigateur

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();
// Composant ThemeProvider qui gère l'état du thème (clair ou sombre), stocke le thème dans le stockage local du navigateur pour persister les préférences de l'utilisateur, applique le thème en ajoutant un attribut data-theme à l'élément racine du document, et fournit une fonction pour basculer entre les thèmes à travers le contexte de thème pour être utilisée dans toute l'application
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("stageflow_theme") || "dark"
  );
// Effet de bord pour appliquer le thème en ajoutant un attribut data-theme à l'élément racine du document, et pour stocker le thème dans le stockage local du navigateur chaque fois que le thème change, assurant que les préférences de thème de l'utilisateur sont persistantes et appliquées à travers l'application
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("stageflow_theme", theme);
  }, [theme]);

  // Fonction pour basculer entre les thèmes clair et sombre, qui met à jour l'état du thème en alternant entre "light" et "dark", permettant aux utilisateurs de changer facilement le thème de l'interface utilisateur en fonction de leurs préférences
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Rendu du fournisseur de contexte de thème, en fournissant le thème actuel et la fonction pour basculer le thème à travers le contexte pour être utilisée dans toute l'application, tout en affichant les enfants du composant pour permettre à ces données et fonctions d'être accessibles dans toute l'interface utilisateur
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}