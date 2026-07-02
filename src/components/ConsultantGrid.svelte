<script>
  import { fly, fade } from 'svelte/transition';
  import { withBase } from '../lib/url';
  import { prefersReducedMotion } from '../lib/motion';

  const reduceMotion = prefersReducedMotion();

  /** @type {{
    slug: string,
    name: string,
    headshotSrc: string,
    classYear: number,
    majorMinorLabel: string,
    majorsForFilter: string[],
    skillAreas: string[],
    tools: string[],
    coursework: {course: string, instructor?: string, term?: string}[],
    languages: string[],
  }[]} */
  export let consultants = [];

  let skillAreaFilter = '';
  let toolFilter = '';
  let majorFilter = '';
  let courseFilter = '';
  let languageFilter = '';

  function unique(values) {
    return Array.from(new Set(values)).sort();
  }

  const allSkillAreas = unique(consultants.flatMap((c) => c.skillAreas));
  const allTools = unique(consultants.flatMap((c) => c.tools));
  const allMajors = unique(consultants.flatMap((c) => c.majorsForFilter));
  const allCourses = unique(consultants.flatMap((c) => c.coursework.map((cw) => cw.course)));
  const allLanguages = unique(consultants.flatMap((c) => c.languages));

  $: filtered = consultants.filter((c) => {
    const matchesSkillArea = !skillAreaFilter || c.skillAreas.includes(skillAreaFilter);
    const matchesTool = !toolFilter || c.tools.includes(toolFilter);
    const matchesMajor = !majorFilter || c.majorsForFilter.includes(majorFilter);
    const matchesCourse = !courseFilter || c.coursework.some((cw) => cw.course === courseFilter);
    const matchesLanguage = !languageFilter || c.languages.includes(languageFilter);
    return matchesSkillArea && matchesTool && matchesMajor && matchesCourse && matchesLanguage;
  });

  function resetFilters() {
    skillAreaFilter = '';
    toolFilter = '';
    majorFilter = '';
    courseFilter = '';
    languageFilter = '';
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500 dark:text-slate-400" for="skill-area">Skill area</label>
      <select id="skill-area" bind:value={skillAreaFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Any</option>
        {#each allSkillAreas as skillArea}
          <option value={skillArea}>{skillArea}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500 dark:text-slate-400" for="tool">Tool</label>
      <select id="tool" bind:value={toolFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Any</option>
        {#each allTools as tool}
          <option value={tool}>{tool}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500 dark:text-slate-400" for="major">Major</label>
      <select id="major" bind:value={majorFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Any</option>
        {#each allMajors as major}
          <option value={major}>{major}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500 dark:text-slate-400" for="course">Course</label>
      <select id="course" bind:value={courseFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Any</option>
        {#each allCourses as course}
          <option value={course}>{course}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500 dark:text-slate-400" for="language">Language</label>
      <select id="language" bind:value={languageFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Any</option>
        {#each allLanguages as language}
          <option value={language}>{language}</option>
        {/each}
      </select>
    </div>
    <button
      on:click={resetFilters}
      class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      Reset
    </button>
    <span class="ml-auto text-sm text-slate-500 dark:text-slate-400">{filtered.length} of {consultants.length} consultants</span>
  </div>

  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each filtered as consultant (consultant.slug)}
      <a
        href={withBase(`consultants/${consultant.slug}`)}
        class="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        in:fly={{ y: 12, duration: reduceMotion ? 0 : 250 }}
        out:fade={{ duration: reduceMotion ? 0 : 120 }}
      >
        <div class="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img
            src={consultant.headshotSrc}
            alt={consultant.name}
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            style={`view-transition-name: headshot-${consultant.slug}`}
          />
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">{consultant.name}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Class of {consultant.classYear}</p>
          <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{consultant.majorMinorLabel}</p>
          {#if consultant.skillAreas.length > 0 || consultant.tools.length > 0}
            <div class="mt-2 flex flex-wrap gap-1.5">
              {#each consultant.skillAreas as skillArea}
                <span class="rounded-full bg-lake-blue/10 px-2 py-0.5 text-xs font-medium text-lake-blue dark:bg-lake-blue/30 dark:text-cool-gray-1">{skillArea}</span>
              {/each}
              {#each consultant.tools as tool}
                <span class="rounded-full bg-davidson-red/10 px-2 py-0.5 text-xs font-medium text-davidson-red-deep dark:bg-davidson-red/30 dark:text-cool-gray-1">{tool}</span>
              {/each}
            </div>
          {/if}
        </div>
      </a>
    {:else}
      <p class="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">No consultants match those filters.</p>
    {/each}
  </div>
</div>
