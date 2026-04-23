import { useEffect } from "react";// Importer le hook useEffect depuis React pour exécuter une fonction de rappel lorsque le composant est monté ou lorsque le chemin de la page change
import { useLocation } from "react-router-dom";// Importer le hook useLocation depuis react-router-dom pour accéder à l'objet de localisation qui contient des informations sur le chemin actuel de la page, utilisé pour déclencher le défilement vers le haut lorsque le chemin change

// Composant ScrollToTop qui fait défiler la page vers le haut chaque fois que le chemin de la page change, en utilisant le hook useEffect pour écouter les changements de chemin et la fonction window.scrollTo pour faire défiler la page vers le haut

function ScrollToTop() {
  // Accéder à l'objet de localisation pour obtenir le chemin actuel de la page, et utiliser le hook useEffect pour faire défiler la page vers le haut chaque fois que le chemin change, en appelant la fonction window.scrollTo avec les coordonnées (0, 0) pour faire défiler vers le haut de la page
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);// Faire défiler la page vers le haut chaque fois que le chemin de la page change, en utilisant le hook useEffect pour écouter les changements de chemin et la fonction window.scrollTo pour faire défiler la page vers le haut
  return null;
}

export default ScrollToTop;