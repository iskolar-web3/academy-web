import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditForm } from "#/components/account/ProfileEditForm";

/** Edit own student profile (STU-01). */
export const Route = createFileRoute("/student/profile")({
	component: StudentProfileEdit,
});

function StudentProfileEdit() {
	return (
		<div className="mx-auto max-w-2xl">
			<p className="eyebrow mb-2">Student profile</p>
			<h1 className="mb-8 text-3xl text-content-heading">Edit your profile</h1>
			<ProfileEditForm variant="student" />
		</div>
	);
}
