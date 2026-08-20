import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InterestButton } from "#/components/interest/InterestButton";
import { ProjectDetailView } from "#/components/project/ProjectDetailView";
import { UpvoteButton } from "#/components/project/UpvoteButton";
import { VaultAccessButton } from "#/components/vault/VaultAccessButton";
import { useSession } from "#/hooks/auth/useSession";
import { useToggleUpvote } from "#/hooks/upvote/useToggleUpvote";
import { AcademyRole } from "#/lib/auth/model";
import { showcaseProjectQuery } from "#/lib/discover/api";

/**
 * Public / sponsor project detail — opened from a Discover gallery card. Renders the
 * design-template PROJECT DETAIL (`ProjectDetailView`) over the live published projection,
 * with the template's interact rail: the large upvote (PLT-08), the sponsor-only
 * "I'm interested" action (SPN-07), and the privacy note shown to every viewer.
 */
export const Route = createFileRoute("/_app/projects/$projectId")({
	component: PublicProjectDetail,
});

function PublicProjectDetail() {
	const { projectId } = Route.useParams();
	const { role } = useSession();
	const {
		data: project,
		isLoading,
		isError,
	} = useQuery(showcaseProjectQuery(projectId));
	const toggle = useToggleUpvote();

	if (isLoading) {
		return (
			<p className="py-10 text-center text-[14px] text-content-soft">
				Loading project…
			</p>
		);
	}

	if (isError || !project) {
		return (
			<div className="card-surface mx-auto max-w-md p-8 text-center">
				<p className="text-content-heading">Project not found</p>
				<Link to="/discover" className="btn btn-secondary mt-4">
					Back to showcase
				</Link>
			</div>
		);
	}

	const viewer = role === AcademyRole.Sponsor ? "sponsor" : "public";

	return (
		<div>
			<Link
				to="/discover"
				className="mb-5 inline-block text-[14.5px] text-action"
			>
				← Back to showcase
			</Link>
			<ProjectDetailView
				project={project}
				viewer={viewer}
				interact={
					<>
						<UpvoteButton
							size="lg"
							count={project.upvotes}
							upvoted={project.upvotedByMe}
							onToggle={() => toggle.mutate(project.id)}
							title={`Upvote ${project.title}`}
						/>
						{viewer === "sponsor" ? (
							<>
								<InterestButton projectId={project.id} />
								<VaultAccessButton
									projectId={project.id}
									status={project.vaultAccessStatus}
								/>
							</>
						) : null}
						<p className="mt-2.5 text-center font-mono text-[12px] leading-[1.5] text-content-faint">
							Interest reveals only you
							<br />
							to the student, never their contact.
						</p>
					</>
				}
			/>
		</div>
	);
}
