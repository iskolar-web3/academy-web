import { Link } from "@tanstack/react-router";
import { BACKEND_URL } from "#/lib/api";
import type { ShowcaseProject } from "#/lib/discover/model";

/** A compact project preview that opens the full project detail. */
export function DiscoverCard({ project }: { project: ShowcaseProject }) {
	return (
		<Link
			to="/projects/$projectId"
			params={{ projectId: project.id }}
			className="card-surface block min-w-0 overflow-hidden rounded-[15px] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-action hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
		>
			{project.imageUrl ? (
				<div className="flex justify-center bg-surface-card px-4 pt-4">
					<img
						src={`${BACKEND_URL}${project.imageUrl}`}
						alt={`${project.title} screenshot`}
						className="aspect-square w-full max-w-56 object-contain"
					/>
				</div>
			) : null}
			<div className="p-4">
				<h2
					className="truncate text-[18px] leading-tight text-content-heading"
					title={project.title}
				>
					{project.title}
				</h2>
				<p className="mt-1 truncate text-[12px] text-content-faint">
					{project.school || "iSkolar Academy"}
				</p>
				<p className="mt-3 line-clamp-3 text-[14px] leading-normal text-content-soft">
					{project.pitch}
				</p>
			</div>
		</Link>
	);
}
