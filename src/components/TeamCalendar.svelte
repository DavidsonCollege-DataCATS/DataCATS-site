<script>
  import { onMount, onDestroy } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import listPlugin from '@fullcalendar/list';
  import interactionPlugin from '@fullcalendar/interaction';
  import { davidsonColors } from '../lib/colors';
  import standingOfficeHours from '../data/standingOfficeHours.json';

  /** @type {{slug: string, name: string, title: string, start: string, end: string, mode: string}[]} */
  export let events = [];
  /** Weekly recurring bookable slots (e.g. standing office hours), as opposed to one-off dated `events`.
   * @type {{slug: string, name: string, title: string, daysOfWeek: number[], startTime: string, endTime: string, startRecur?: string, endRecur?: string, mode: string}[]} */
  export let recurringEvents = [];
  /** @type {{slug: string, name: string, skillAreas: string[], tools: string[], majorsForFilter: string[], coursework: {course: string, instructor?: string, term?: string}[], languages: string[]}[]} */
  export let consultants = [];
  /** Called with the clicked event when it's an open slot. Only used for individual (single-consultant) calendars. */
  export let onSlotClick = null;

  let calendarEl;
  let calendar;

  let tutorFilter = '';
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

  // Standing team drop-in hours (Chambers 3146) — recurring, not tied to any one
  // consultant. Rendered as a non-interactive background band on every calendar
  // (team and individual) so it never looks like a specific person's shift.
  const standingOfficeHourEvents = standingOfficeHours.map((oh, i) => ({
    id: `standing-office-hours-${i}`,
    daysOfWeek: oh.daysOfWeek,
    startTime: oh.startTime,
    endTime: oh.endTime,
    startRecur: oh.startRecur,
    endRecur: oh.endRecur,
    display: 'background',
    backgroundColor: davidsonColors.sandstone,
  }));

  // "either" means the slot is offered as in-person or virtual, interchangeably —
  // rendered as a red/blue split so it reads as "both", not a third unrelated mode.
  function eventColorFor(mode) {
    if (mode === 'virtual') return { backgroundColor: davidsonColors.lakeBlue, borderColor: davidsonColors.lakeBlue };
    if (mode === 'either') return { backgroundColor: davidsonColors.black, borderColor: davidsonColors.black };
    return { backgroundColor: davidsonColors.red, borderColor: davidsonColors.red };
  }

  function resetFilters() {
    tutorFilter = '';
    skillAreaFilter = '';
    toolFilter = '';
    majorFilter = '';
    courseFilter = '';
    languageFilter = '';
  }

  // Filters are inlined directly in this statement (rather than called through a helper)
  // so Svelte's dependency tracking picks up tutorFilter/skillAreaFilter/etc. and re-runs on change.
  $: visibleEvents = events
    .filter((e) => {
      const c = consultants.find((x) => x.slug === e.slug);
      if (!c) return true;
      if (tutorFilter && e.slug !== tutorFilter) return false;
      if (skillAreaFilter && !c.skillAreas.includes(skillAreaFilter)) return false;
      if (toolFilter && !c.tools.includes(toolFilter)) return false;
      if (majorFilter && !c.majorsForFilter.includes(majorFilter)) return false;
      if (courseFilter && !c.coursework.some((cw) => cw.course === courseFilter)) return false;
      if (languageFilter && !c.languages.includes(languageFilter)) return false;
      return true;
    })
    .map((e) => ({
      id: `${e.slug}-${e.start}`,
      title: consultants.length > 1 ? `${e.name} — ${e.title}` : e.title,
      start: e.start,
      end: e.end,
      ...eventColorFor(e.mode),
      textColor: '#ffffff',
      extendedProps: { slug: e.slug, mode: e.mode },
    }))
    .concat(
      recurringEvents
        .filter((e) => {
          const c = consultants.find((x) => x.slug === e.slug);
          if (!c) return true;
          if (tutorFilter && e.slug !== tutorFilter) return false;
          if (skillAreaFilter && !c.skillAreas.includes(skillAreaFilter)) return false;
          if (toolFilter && !c.tools.includes(toolFilter)) return false;
          if (majorFilter && !c.majorsForFilter.includes(majorFilter)) return false;
          if (courseFilter && !c.coursework.some((cw) => cw.course === courseFilter)) return false;
          if (languageFilter && !c.languages.includes(languageFilter)) return false;
          return true;
        })
        .map((e, i) => ({
          id: `recurring-${e.slug}-${i}`,
          title: consultants.length > 1 ? `${e.name} — ${e.title}` : e.title,
          daysOfWeek: e.daysOfWeek,
          startTime: e.startTime,
          endTime: e.endTime,
          startRecur: e.startRecur,
          endRecur: e.endRecur,
          ...eventColorFor(e.mode),
          textColor: '#ffffff',
          classNames: e.mode === 'either' ? ['fc-event-either'] : [],
          extendedProps: { slug: e.slug, mode: e.mode },
        })),
    )
    .concat(standingOfficeHourEvents);

  $: if (calendar) {
    calendar.removeAllEvents();
    visibleEvents.forEach((e) => calendar.addEvent(e));
  }

  onMount(() => {
    calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,dayGridMonth,listWeek',
      },
      height: 'auto',
      slotMinTime: '08:00:00',
      events: visibleEvents,
      eventClick: (info) => {
        // The standing-office-hours band is a `display: 'background'` event with no
        // slug of its own — it's ambient context, not a bookable slot.
        if (info.event.display !== 'background' && onSlotClick) {
          onSlotClick({
            start: info.event.start,
            end: info.event.end,
            slug: info.event.extendedProps.slug,
          });
        }
      },
    });
    calendar.render();
    markDecorativeIcons();
  });

  // FullCalendar's prev/next/today icon spans render with role="img" but no
  // accessible name of their own; their parent <button> already has a
  // descriptive title (e.g. "Previous week"), so the icons are just noise
  // to a screen reader and should be hidden rather than separately labeled.
  function markDecorativeIcons() {
    calendarEl?.querySelectorAll('.fc-icon').forEach((icon) => icon.setAttribute('aria-hidden', 'true'));
  }

  onDestroy(() => {
    calendar?.destroy();
  });
</script>

<div class="space-y-4">
  {#if consultants.length > 1}
    <div class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500 dark:text-neutral-400" for="tutor">Consultant</label>
        <select id="tutor" bind:value={tutorFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <option value="">Any</option>
          {#each consultants as c}
            <option value={c.slug}>{c.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500 dark:text-neutral-400" for="cal-skill-area">Skill area</label>
        <select id="cal-skill-area" bind:value={skillAreaFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <option value="">Any</option>
          {#each allSkillAreas as skillArea}
            <option value={skillArea}>{skillArea}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500 dark:text-neutral-400" for="cal-tool">Tool</label>
        <select id="cal-tool" bind:value={toolFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <option value="">Any</option>
          {#each allTools as tool}
            <option value={tool}>{tool}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500 dark:text-neutral-400" for="cal-major">Major</label>
        <select id="cal-major" bind:value={majorFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <option value="">Any</option>
          {#each allMajors as major}
            <option value={major}>{major}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500 dark:text-neutral-400" for="cal-course">Course</label>
        <select id="cal-course" bind:value={courseFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <option value="">Any</option>
          {#each allCourses as course}
            <option value={course}>{course}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500 dark:text-neutral-400" for="cal-language">Language</label>
        <select id="cal-language" bind:value={languageFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <option value="">Any</option>
          {#each allLanguages as language}
            <option value={language}>{language}</option>
          {/each}
        </select>
      </div>
      <button
        on:click={resetFilters}
        class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        Reset
      </button>
    </div>
  {/if}
  <div class="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-neutral-400">
    <span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded-full bg-davidson-red"></span> In-person</span>
    <span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded-full bg-lake-blue"></span> Virtual</span>
    <span class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-full border border-davidson-black fc-event-either"></span>
      In-person or virtual
    </span>
    <span class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-full bg-sandstone border border-deep-taupe"></span>
      Team drop-in hours (Chambers 3146) — not specific to this consultant
    </span>
  </div>

  <div bind:this={calendarEl} class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"></div>
</div>
