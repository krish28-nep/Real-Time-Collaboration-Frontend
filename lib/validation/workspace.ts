import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required.").max(50, "Workspace name is too long."),
});

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;
