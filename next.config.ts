import type { NextConfig } from "next";

/* O app legado (index.html + js/ + css/) segue de pé em paralelo durante a
   migração — roda com `npm run dev:legacy`. O corte é o passo 5 da ADR-012. */
const config: NextConfig = {
  output: "export",
  typedRoutes: true,
};

export default config;
