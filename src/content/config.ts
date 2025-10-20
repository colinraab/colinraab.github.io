import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    projectLink: z.string().url().optional(),
    repoLink: z.string().url().optional(),
    minutesRead: z.number().int().positive().optional(),
    canonical: z.string().url().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog };
