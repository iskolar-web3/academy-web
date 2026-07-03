import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditForm } from "#/components/account/ProfileEditForm";

/** Edit own sponsor profile (SPN-01). */
export const Route = createFileRoute("/sponsor/profile")({
	component: ProfileEditForm,
});
