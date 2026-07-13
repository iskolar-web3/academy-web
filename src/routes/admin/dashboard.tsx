import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MetricsPanel } from "#/components/admin/MetricsPanel";
import { ModerationPanel } from "#/components/admin/ModerationPanel";
import { ReviewDecisionModal } from "#/components/admin/ReviewDecisionModal";
import { ReviewQueuePanel } from "#/components/admin/ReviewQueuePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { useOpenGrants } from "#/hooks/grant/useGrants";
import {
	useModerationProjects,
	useReviewQueue,
} from "#/hooks/review/useReviewQueue";
import type { Project } from "#/lib/project/model";

/**
 * Admin console (P2) — a 1:1 port of the design-template ADMIN screen: a sticky 220px
 * tab-rail (Review queue · Moderation · Metrics) beside the active panel, with the review
 * decision as a modal. The rail is a Radix Tabs (arrow-key nav, aria-selected). Admin-only
 * (guarded by the `/admin` shell; the server re-enforces `requireRole`).
 */
export const Route = createFileRoute("/admin/dashboard")({
	component: AdminConsole,
});

const TABS = [
	{ key: "queue", label: "Review queue" },
	{ key: "moderation", label: "Moderation" },
	{ key: "metrics", label: "Metrics" },
] as const;

function AdminConsole() {
	const [reviewProject, setReviewProject] = useState<Project | null>(null);

	const queue = useReviewQueue();
	const moderation = useModerationProjects();
	const grants = useOpenGrants();
	const openGrants = (grants.data ?? []).filter((g) => g.status === "open");

	return (
		<>
			<Tabs
				defaultValue="queue"
				orientation="vertical"
				className="mx-auto grid max-w-[1340px] grid-cols-1 items-start gap-[30px] lg:grid-cols-[220px_1fr]"
			>
				<aside className="lg:sticky lg:top-[84px]">
					<div className="mb-4 flex items-center gap-2.5">
						<span className="h-0.5 w-[26px] bg-action/55" aria-hidden />
						<span className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-action/60">
							Admin
						</span>
					</div>
					<TabsList className="flex-row lg:flex-col lg:items-stretch">
						{TABS.map((t) => (
							<TabsTrigger key={t.key} value={t.key}>
								{t.label}
							</TabsTrigger>
						))}
					</TabsList>
				</aside>

				<div>
					<TabsContent value="queue">
						<ReviewQueuePanel
							projects={queue.data ?? []}
							isLoading={queue.isLoading}
							isError={queue.isError}
							onOpen={setReviewProject}
						/>
					</TabsContent>
					<TabsContent value="moderation">
						<ModerationPanel
							projects={moderation.data ?? []}
							isLoading={moderation.isLoading}
							isError={moderation.isError}
							grants={openGrants}
							grantsLoading={grants.isLoading}
							grantsError={grants.isError}
						/>
					</TabsContent>
					<TabsContent value="metrics">
						<MetricsPanel />
					</TabsContent>
				</div>
			</Tabs>

			{reviewProject ? (
				<ReviewDecisionModal
					project={reviewProject}
					onClose={() => setReviewProject(null)}
				/>
			) : null}
		</>
	);
}
