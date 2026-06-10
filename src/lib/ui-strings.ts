// Native UI strings — the chrome that authors can't set from Markdown
// (sidebar/footer/search/TOC labels, etc.). These are localized here so a
// /<lang> page reads entirely in that language, not just its content.
//
// `en` is the complete base and the fallback: any language may translate as
// many or as few keys as it likes; missing keys fall back to English. The
// docs' own languages (de/fr/es) live inline below; ~40 more languages are
// split into ui-strings.extra-*.ts and merged in. To add a language, add it
// to one of those files (or inline) — that's all.

import { dicts as extraA } from './ui-strings.extra-a';
import { dicts as extraB } from './ui-strings.extra-b';
import { dicts as extraC } from './ui-strings.extra-c';
import { dicts as extraD } from './ui-strings.extra-d';

const en = {
	onThisPage: 'On this page',
	previous: 'Previous',
	next: 'Next',
	searchDocs: 'Search docs…',
	searchPlaceholder: 'Search the docs…',
	searchStart: 'Start typing to search.',
	searchNoResults: 'No results',
	searchLoading: 'Loading search index…',
	getStarted: 'Get started',
	viewSource: 'View source',
	page: 'page',
	pages: 'pages',
	builtWith: 'built with',
	editOnGithub: 'Edit on GitHub',
	poweredBy: 'Powered by',
	listAnd: 'and',
	renderingDiagram: 'Rendering diagram…',
	copyCode: 'Copy code',
	copied: 'Copied',
	language: 'Language',
	newer: 'Newer',
	older: 'Older',
	minRead: 'min read'
};

export type UIKey = keyof typeof en;
type Dict = Partial<Record<UIKey, string>>;

const de: Dict = {
	onThisPage: 'Auf dieser Seite',
	previous: 'Zurück',
	next: 'Weiter',
	searchDocs: 'Suchen…',
	searchPlaceholder: 'Dokumentation durchsuchen…',
	searchStart: 'Tippen, um zu suchen.',
	searchNoResults: 'Keine Ergebnisse',
	searchLoading: 'Suchindex wird geladen…',
	getStarted: 'Loslegen',
	viewSource: 'Quellcode ansehen',
	page: 'Seite',
	pages: 'Seiten',
	builtWith: 'erstellt mit',
	editOnGithub: 'Auf GitHub bearbeiten',
	poweredBy: 'Basiert auf',
	listAnd: 'und',
	renderingDiagram: 'Diagramm wird gerendert…',
	copyCode: 'Code kopieren',
	copied: 'Kopiert',
	language: 'Sprache',
	newer: 'Neuer',
	older: 'Älter',
	minRead: 'Min. Lesezeit'
};

const fr: Dict = {
	onThisPage: 'Sur cette page',
	previous: 'Précédent',
	next: 'Suivant',
	searchDocs: 'Rechercher…',
	searchPlaceholder: 'Rechercher dans la documentation…',
	searchStart: 'Commencez à taper pour rechercher.',
	searchNoResults: 'Aucun résultat',
	searchLoading: "Chargement de l'index…",
	getStarted: 'Commencer',
	viewSource: 'Voir le code source',
	page: 'page',
	pages: 'pages',
	builtWith: 'réalisé avec',
	editOnGithub: 'Modifier sur GitHub',
	poweredBy: 'Propulsé par',
	listAnd: 'et',
	renderingDiagram: 'Rendu du diagramme…',
	copyCode: 'Copier le code',
	copied: 'Copié',
	language: 'Langue',
	newer: 'Plus récent',
	older: 'Plus ancien',
	minRead: 'min de lecture'
};

const es: Dict = {
	onThisPage: 'En esta página',
	previous: 'Anterior',
	next: 'Siguiente',
	searchDocs: 'Buscar…',
	searchPlaceholder: 'Buscar en la documentación…',
	searchStart: 'Empieza a escribir para buscar.',
	searchNoResults: 'Sin resultados',
	searchLoading: 'Cargando el índice…',
	getStarted: 'Empezar',
	viewSource: 'Ver el código fuente',
	page: 'página',
	pages: 'páginas',
	builtWith: 'creado con',
	editOnGithub: 'Editar en GitHub',
	poweredBy: 'Con la tecnología de',
	listAnd: 'y',
	renderingDiagram: 'Renderizando el diagrama…',
	copyCode: 'Copiar código',
	copied: 'Copiado',
	language: 'Idioma',
	newer: 'Más reciente',
	older: 'Más antiguo',
	minRead: 'min de lectura'
};

const dictionaries: Record<string, Dict> = {
	en,
	de,
	fr,
	es,
	...(extraA as Record<string, Dict>),
	...(extraB as Record<string, Dict>),
	...(extraC as Record<string, Dict>),
	...(extraD as Record<string, Dict>)
};

/** Every language that has at least some UI-string coverage. */
export const uiLanguages = Object.keys(dictionaries);

/** Translate a UI key into `lang`, falling back to English for any missing
 *  language or key. */
export function t(lang: string, key: UIKey): string {
	return dictionaries[lang]?.[key] ?? en[key];
}
