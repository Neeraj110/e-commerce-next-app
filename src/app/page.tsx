// Root page delegates to the React Server Component in homepage/page.tsx
// which fetches featured products on the server (ISR, revalidate = 300s).
export { default } from "./homepage/page";
