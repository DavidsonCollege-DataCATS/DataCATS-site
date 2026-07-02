import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const socialsSchema = z
  .object({
    linkedin: z.string().url().optional().nullable(),
    github: z.string().url().optional().nullable(),
    instagram: z.string().url().optional().nullable(),
    website: z.string().url().optional().nullable(),
  })
  .default({});

const consultants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/consultants' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        pronouns: z.string().optional().nullable(),
        headshot: image(),
        email: z.string().email(),
        classYear: z.number().int(),
        // Declared majors take precedence; if empty, the student has intended majors instead.
        majors: z.array(z.string()).max(2).default([]),
        intendedMajors: z.array(z.string()).max(2).default([]),
        minor: z.string().optional().nullable(),
        // General competencies (e.g. "Machine Learning", "Data Visualization").
        skillAreas: z.array(z.string()).default([]),
        // Specific languages/tools (e.g. "Python", "SQL", "Power BI").
        tools: z.array(z.string()).default([]),
        // Courses the consultant has taken. instructor/term are optional so an entry can be
        // added before those details are known.
        coursework: z
          .array(
            z.object({
              course: z.string(),
              instructor: z.string().optional().nullable(),
              term: z.string().optional().nullable(),
            }),
          )
          .default([]),
        languages: z.array(z.string()).default([]),
        homeCountry: z.string(),
        socials: socialsSchema,
        experience: z
          .array(
            z.object({
              title: z.string(),
              organization: z.string(),
              dates: z.string().optional().nullable(),
              description: z.string().optional().nullable(),
            }),
          )
          .default([]),
        meetingModes: z.array(z.enum(['in-person', 'virtual'])).default(['in-person', 'virtual']),
        // Only consultants who take bookable appointments have a scheduler link.
        zoomSchedulerUrl: z.string().url().optional().nullable(),
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

const faculty = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faculty' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      pronouns: z.string().optional().nullable(),
      headshot: image(),
      titles: z.array(z.string()).min(1),
      department: z.string(),
      office: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      skillAreas: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
      coursework: z.array(z.string()).default([]),
      languages: z.array(z.string()).default([]),
      homeCountry: z.string(),
      socials: socialsSchema,
      experience: z
        .array(
          z.object({
            title: z.string(),
            organization: z.string(),
            dates: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
          }),
        )
        .default([]),
      meetingModes: z.array(z.enum(['in-person', 'virtual'])).default(['in-person', 'virtual']),
      zoomSchedulerUrl: z.string().url().optional().nullable(),
      active: z.boolean().default(true),
    }),
});

export const collections = { consultants, faculty };
