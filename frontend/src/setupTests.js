// Vitest setup — extends expect with @testing-library/jest-dom matchers
import "@testing-library/jest-dom/vitest";
 if (typeof document.queryCommandSupported !== 'function') {
  document.queryCommandSupported = () => false;
}