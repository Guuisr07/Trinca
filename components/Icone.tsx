import {
  Armchair,
  Crown,
  Flame,
  Hand,
  Layers,
  Lock,
  type LucideIcon,
  Map,
  Swords,
  RefreshCw,
  Split,
  Target,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";
import { ehNomeIcone, type NomeIcone } from "@/lib/icones.ts";

/* Resolve o nome que vem do conteúdo (`icone: "Crown"`) no componente lucide.

   O mapa é explícito e os imports são nomeados de propósito. `import * as
   lucide` resolveria qualquer nome, mas empacotaria os mais de mil ícones da
   biblioteca: nome resolvido em tempo de execução não tem como ser
   tree-shaken. Aqui entra só o que o app usa.

   O `Record<NomeIcone, ...>` é a trava — faltou registrar um ícone da lista
   de lib/icones.ts, o build não passa. */
const ICONES: Record<NomeIcone, LucideIcon> = {
  Armchair,
  Crown,
  Hand,
  Layers,
  RefreshCw,
  Split,
  WalletCards,
  Flame,
  Lock,
  Map,
  Swords,
  Target,
  Trophy,
  Zap,
};

export function Icone({
  nome,
  className = "size-5",
  rotulo,
}: {
  nome: string;
  className?: string;
  /** Só quando o ícone carrega significado sozinho. Com texto ao lado, deixe fora. */
  rotulo?: string;
}) {
  if (!ehNomeIcone(nome)) return null;
  const Svg = ICONES[nome];
  return (
    <Svg
      className={className}
      {...(rotulo ? { role: "img", "aria-label": rotulo } : { "aria-hidden": true })}
    />
  );
}
