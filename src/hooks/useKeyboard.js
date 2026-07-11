import { useEffect } from "react";

export function useKeyboard({ onLetter, onBackspace, onSubmit, isEnabled = true }) {
  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
        return;
      }

      if (Array.from(event.key).length === 1 && /\p{L}/u.test(event.key)) {
        event.preventDefault();
        onLetter(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, onBackspace, onLetter, onSubmit]);
}
