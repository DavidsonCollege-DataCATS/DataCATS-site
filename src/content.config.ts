import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const consultants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/consultants' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        pronouns: z.string().optional(),
        headshot: image(),
        classYear: z.number().int(),
        // Declared majors take precedence; if empty, the student has intended majors instead.
        majors: z.array(z.string()).max(2).default([]),
        intendedMajors: z.array(z.string()).max(2).default([]),
        minor: z.string().optional(),
        skills: z.array(z.string()).default([]),
        coursework: z.array(z.string()).default([]),
        languages: z.array(z.string()).default([]),
        homeCountry: z.string(),
        experience: z
          .array(
            z.object({
              title: z.string(),
              organization: z.string(),
              dates: z.string().optional(),
              description: z.string().optional(),
            }),
          )
          .default([]),
        meetingModes: z.array(z.enum(['in-person', 'virtual'])).default(['in-person', 'virtual']),
        // Only consultants who take bookable appointments have a scheduler link.
        zoomSchedulerUrl: z.string().url().optional(),
        active: z.boolean().default(true),
      })
      .refine((data) => data.majors.length > 0 || data.intendedMajors.length > 0, {
        message: 'A consultant must have at least one declared or intended major.',
      })
      .refine((data) => !(data.majors.length === 2 && data.minor), {
        message: 'A consultant with two majors cannot also have a minor.',
      })
      .refine((data) => !(data.intendedMajors.length === 2 && data.minor), {
        message: 'A consultant with two intended majors cannot also have a minor.',
      }),
});

export const collections = { consultants };
