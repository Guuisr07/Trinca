/* Boot. Único arquivo que conhece a ordem de ligação dos módulos. */

import { render, ligarNav } from "./telas.js";
import { ligarLicao } from "./licao.js";
import { ligarLanding } from "./landing.js";
import { ligarTema } from "./tema.js";

ligarLicao(render);   // fechar a lição repinta a trilha (evita ciclo telas <-> licao)
ligarNav();
ligarLanding();
ligarTema();
render();
