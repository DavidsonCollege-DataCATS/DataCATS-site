<script>
  import { fly, fade } from 'svelte/transition';

  /** @type {{
    slug: string,
    name: string,
    headshotSrc: string,
    classYear: number,
    majorMinorLabel: string,
    majorsForFilter: string[],
    skills: string[],
    coursework: string[],
    languages: string[],
  }[]} */
  export let consultants = [];

  let query = '';
  let skillFilter = '';
  let majorFilter = '';
  let courseFilter = '';
  let languageFilter = '';

  function unique(values) {
    return Array.from(new Set(values)).sort();
  }

  const allSkills = unique(consultants.flatMap((c) => c.skills));
  const allMajors = unique(consultants.flatMap((c) => c.majorsForFilter));
  const allCourses = unique(consultants.flatMap((c) => c.coursework));
  const allLanguages = unique(consultants.flatMap((c) => c.languages));

  $: filtered = consultants.filter((c) => {
    const matchesQuery = query.trim().length === 0 || c.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesSkill = !skillFilter || c.skills.includes(skillFilter);
    const matchesMajor = !majorFilter || c.majorsForFilter.includes(majorFilter);
    const matchesCourse = !courseFilter || c.coursework.includes(courseFilter);
    const matchesLanguage = !languageFilter || c.languages.includes(languageFilter);
    return matchesQuery && matchesSkill && matchesMajor && matchesCourse && matchesLanguage;
  });

  function resetFilters() {
    query = '';
    skillFilter = '';
    majorFilter = '';
    courseFilter = '';
    languageFilter = '';
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500" for="search">Search</label>
      <input
        id="search"
        type="text"
        placeholder="Name..."
        bind:value={query}
        class="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-davidson-red focus:outline-none"
      />
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500" for="skill">Skill</label>
      <select id="skill" bind:value={skillFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
        <option value="">Any</option>
        {#each allSkills as skill}
          <option value={skill}>{skill}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500" for="major">Major</label>
      <select id="major" bind:value={majorFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
        <option value="">Any</option>
        {#each allMajors as major}
          <option value={major}>{major}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500" for="course">Course</label>
      <select id="course" bind:value={courseFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
        <option value="">Any</option>
        {#each allCourses as course}
          <option value={course}>{course}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-xs font-medium text-slate-500" for="language">Language</label>
      <select id="language" bind:value={languageFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
        <option value="">Any</option>
        {#each allLanguages as language}
          <option value={language}>{language}</option>
        {/each}
      </select>
    </div>
    <button
      on:click={resetFilters}
      class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
    >
      Reset
    </button>
    <span class="ml-auto text-sm text-slate-500">{filtered.length} of {consultants.length} consultants</span>
  </div>

  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each filtered as consultant (consultant.slug)}
      <a
        href={`/consultants/${consultant.slug}`}
        class="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        in:fly={{ y: 12, duration: 250 }}
        out:fade={{ duration: 120 }}
      >
        <div class="aspect-square w-full overflow-hidden bg-slate-100">
          <img
            src={consultant.headshotSrc}
            alt={consultant.name}
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-slate-900">{consultant.name}</h3>
          <p class="text-sm text-slate-500">Class of {consultant.classYear}</p>
          <p class="mt-1 text-sm text-slate-700">{consultant.majorMinorLabel}</p>
        </div>
      </a>
    {:else}
      <p class="col-span-full py-12 text-center text-slate-500">No consultants match those filters.</p>
    {/each}
  </div>
</div>
