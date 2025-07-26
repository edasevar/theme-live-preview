export interface ThemeElement {
	key: string;
	label: string;
	defaultColor: string;
	group: string;
}

export const themeElements: ThemeElement[] = [
	{ key: "keyword", label: "Keyword", defaultColor: "#ff007f", group: "Syntax" },
	{ key: "function", label: "Function", defaultColor: "#00ffff", group: "Syntax" },
	{ key: "string", label: "String", defaultColor: "#ffff00", group: "Syntax" },
	{ key: "comment", label: "Comment", defaultColor: "#888888", group: "Meta" },
	{ key: "background", label: "Editor Background", defaultColor: "#1e1e1e", group: "UI" },
	{ key: "foreground", label: "Editor Foreground", defaultColor: "#ffffff", group: "UI" }
];
  