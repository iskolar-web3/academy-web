import { createFileRoute, Link } from "@tanstack/react-router";
import { ProjectDetailView } from "#/components/project/ProjectDetailView";
import { useSession } from "#/hooks/auth/useSession";
import { AcademyRole } from "#/lib/auth/model";
import { MOCK_PROJECTS, mockToProject } from "#/lib/discover/mock";

/**
 * Public / sponsor project detail — opened from a Discover gallery card. Renders the
 * design-template PROJECT DETAIL (`ProjectDetailView`); a sponsor sees Express interest,
 * everyone else a read-only view. Reads the mock showcase (real `lib/discover` query +
 * express-interest wiring land in P3).
 */
export const Route = createFileRoute("/_app/projects/$projectId")({
	component: PublicProjectDetail,
});

function PublicProjectDetail() {
	const { projectId } = Route.useParams();
	const { role } = useSession();
	const mock = MOCK_PROJECTS.find((p) => p.id === projectId);

	if (!mock) {
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
			<ProjectDetailView project={mockToProject(mock)} viewer={viewer} />
		</div>
	);
}
