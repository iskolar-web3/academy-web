import { createFileRoute } from "@tanstack/react-router";

/**
 * Grants (P4). The full experience — browse open grants, request a grant with a title
 * proposal, and fund via PayMongo — lands in P4. Placeholder so the header nav resolves.
 */
export const Route = createFileRoute("/_app/grants")({
	component: Grants,
});

function Grants() {
	return (
		<div className="mx-auto max-w-2xl py-16 text-center">
			<p className="eyebrow mb-3 justify-center">Grants</p>
			<h1 className="text-3xl text-content-heading">Fund starting theses</h1>
			<p className="mt-3 text-content-soft">
				Back promising student work at the starting-thesis stage, before it has
				an MVP. Browsing open grants, requesting a grant with a title proposal,
				and funding via PayMongo land in P4.
			</p>
		</div>
	);
}
