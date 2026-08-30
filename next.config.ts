import type { NextConfig } from "next";

/* O app legado (index.html + js/ + css/) segue de pé em paralelo durante a
   migração — roda com `npm run dev:legacy`. O corte é o passo 5 da ADR-012. */
const config: NextConfig = {
  typedRoutes: true,
  headers: async () => [{
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
  }],
};

export default config;
