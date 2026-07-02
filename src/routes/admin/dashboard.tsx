import { createFileRoute } from "@tanstack/react-router";

/**
 * Admin dashboard — placeholder. The review queue, quality gate, and metrics land in P2.
 */
export const Route = createFileRoute("/admin/dashboard")({
	component: AdminDashboard,
});

const STAT_STUBS = [
	{ label: "In review", value: "—" },
	{ label: "Published", value: "—" },
	{ label: "Returned", value: "—" },
	{ label: "Flagged", value: "—" },
];

function AdminDashboard() {
	return (
		<div>
			<p className="eyebrow mb-2">Admin</p>
			<h1 className="text-3xl text-content-heading">Review dashboard</h1>
			<p className="mt-2 text-content-soft">
				The submission queue, quality review, and moderation tools land in P2.
			</p>

			<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{STAT_STUBS.map((stat) => (
					<div key={stat.label} className="card-surface p-6">
						<p className="text-sm text-content-soft">{stat.label}</p>
						<p className="mt-2 text-3xl text-content-heading">{stat.value}</p>
					</div>
				))}
			</div>
		</div>
	);
}
