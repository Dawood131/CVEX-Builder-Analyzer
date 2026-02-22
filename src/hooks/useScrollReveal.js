import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right"
    );

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [location]); // 👈 re-run on route change
}