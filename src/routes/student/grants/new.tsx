import { createFileRoute, Link } from "@tanstack/react-router";
import { GrantForm } from "#/components/grant/GrantForm";

/**
 * Request a grant (STU-14) — a 1:1 port of the design-template CREATE GRANT REQUEST.
 * Reached from the "+ Request a grant" action on the student dashboard.
 */
export const Route = createFileRoute("/student/grants/new")({
	component: CreateGrantRequest,
});

function CreateGrantRequest() {
	return (
		<div className="mx-auto max-w-[760px]">
			<Link
				to="/grants"
				className="mb-[18px] inline-block text-[14.5px] text-action"
			>
				← All grants
			</Link>
			<h1 className="mb-1.5 text-[30px] text-action">Request a grant</h1>
			<p className="mb-[26px] text-[15px] leading-normal text-content-soft">
				For a thesis that is just starting, an approved title proposal but no
				MVP yet. Self-declared, it goes live for sponsors the moment you submit.
			</p>
			<GrantForm />
		</div>
	);
}
