import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

/* next/font hospeda a fonte junto com o app: sem preconnect pro Google, sem
   requisição de terceiro, sem salto de layout. */
const disp = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--fonte-disp",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fonte-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trinca — poker do zero",
  description:
    "Aprenda Texas Hold'em do zero em lições de 3 minutos, com cartas na tela.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF3E6" },
    { media: "(prefers-color-scheme: dark)", color: "#141024" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning: o data-tema é escrito pelo script abaixo, antes
       do React ver o documento. Sem isso, o React reclama da diferença. */
    <html lang="pt-BR" suppressHydrationWarning className={`${disp.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
