import { z } from "zod";

export const projectVerificationCheckSchema = z.object({
	id: z.string(),
	label: z.string(),
	status: z.enum(["pending", "running", "pass", "attention", "error"]),
	evidence: z.string(),
	checkedAt: z.string().nullable(),
});

export type ProjectVerificationCheck = z.infer<
	typeof projectVerificationCheckSchema
>;

export const projectVerificationListSchema = z.array(
	projectVerificationCheckSchema,
);

export function verificationIsActive(
	checks: ProjectVerificationCheck[] | undefined,
): boolean {
	if (!checks?.length) return false;
	return (
		checks.some((check) => check.status === "running") ||
		checks.every((check) => check.status === "pending")
	);
}
