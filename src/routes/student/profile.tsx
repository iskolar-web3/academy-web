import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditForm } from "#/components/account/ProfileEditForm";

/** Edit own student profile (STU-01). */
export const Route = createFileRoute("/student/profile")({
	component: ProfileEditForm,
});
