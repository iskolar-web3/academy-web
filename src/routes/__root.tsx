import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { AuthProvider } from "#/auth";
import { Toaster } from "#/components/ui/sonner";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const socialTitle =
	"Academy | Student projects. Real potential. Greater impact.";
const socialDescription =
	"Showcase working student projects, share thesis grant proposals, and discover student talent.";
const socialImage = "https://academy.iskolar.io/og-academy.png";
const socialImageAlt =
	"Academy combination mark above Student projects. Real potential. Greater impact. The blue Academy logo icon appears on the right.";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Academy",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "Academy" },
			{ property: "og:title", content: socialTitle },
			{ property: "og:description", content: socialDescription },
			{ property: "og:image", content: socialImage },
			{ property: "og:image:type", content: "image/png" },
			{ property: "og:image:width", content: "1733" },
			{ property: "og:image:height", content: "907" },
			{ property: "og:image:alt", content: socialImageAlt },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: socialTitle },
			{ name: "twitter:description", content: socialDescription },
			{ name: "twitter:image", content: socialImage },
			{ name: "twitter:image:alt", content: socialImageAlt },
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/logo-academy.svg",
			},
		],
	}),
	shellComponent: RootDocument,
});

const enableDevtools = import.meta.env.VITE_ENABLE_DEVTOOLS !== "false";

function ClientDevtools() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!enableDevtools || !mounted) return null;

	return (
		<TanStackDevtools
			config={{
				position: "bottom-left",
			}}
			plugins={[
				{
					name: "Tanstack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
				TanStackQueryDevtools,
			]}
		/>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		// suppressHydrationWarning on <html>/<body> ONLY: browser extensions (ColorZilla →
		// `cz-shortcut-listen`, Grammarly → `data-gr-*`, LanguageTool → `data-lt-*`) mutate
		// these two elements before React hydrates, producing false attribute mismatches. This
		// suppresses those (one level deep — attributes of html/body), NOT real mismatches in
		// our own components, which still warn. See project CLAUDE.md "SSR & Hydration".
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				<AuthProvider>{children}</AuthProvider>
				<Toaster />
				<ClientDevtools />
				<Scripts />
			</body>
		</html>
	);
}
