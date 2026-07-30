import { z } from "zod";

export const channelSchema = z.object({
  name: z.string().trim().min(1, "Channel name is required.").max(50, "Channel name is too long."),
});

export type ChannelFormValues = z.infer<typeof channelSchema>;
