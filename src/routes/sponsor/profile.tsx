import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditForm } from "#/components/account/ProfileEditForm";

/** Edit own sponsor profile (SPN-01). */
export const Route = createFileRoute("/sponsor/profile")({
	component: SponsorProfileEdit,
});

function SponsorProfileEdit() {
	return (
		<div className="mx-auto max-w-2xl">
			<p className="eyebrow mb-2">Sponsor profile</p>
			<h1 className="mb-8 text-3xl text-content-heading">Edit your profile</h1>
			<ProfileEditForm variant="sponsor" />
		</div>
	);
}
