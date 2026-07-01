<script>
  import { onMount, onDestroy } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import listPlugin from '@fullcalendar/list';
  import interactionPlugin from '@fullcalendar/interaction';
  import { davidsonColors } from '../lib/colors';

  /** @type {{slug: string, name: string, title: string, start: string, end: string, mode: string, status: string}[]} */
  export let events = [];
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
      backgroundColor:
        e.status === 'booked' ? davidsonColors.coolGray6 : e.mode === 'virtual' ? davidsonColors.lakeBlue : davidsonColors.red,
      borderColor:
        e.status === 'booked' ? davidsonColors.coolGray6 : e.mode === 'virtual' ? davidsonColors.lakeBlue : davidsonColors.red,
      textColor: '#ffffff',
      extendedProps: { slug: e.slug, mode: e.mode, status: e.status },
    }));

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
        const { status } = info.event.extendedProps;
        if (status === 'open' && onSlotClick) {
          onSlotClick({
            start: info.event.start,
            end: info.event.end,
            slug: info.event.extendedProps.slug,
          });
        }
      },
    });
    calendar.render();
  });

  onDestroy(() => {
    calendar?.destroy();
  });
</script>

<div class="space-y-4">
  {#if consultants.length > 1}
    <div class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500" for="tutor">Consultant</label>
        <select id="tutor" bind:value={tutorFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any</option>
          {#each consultants as c}
            <option value={c.slug}>{c.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500" for="cal-skill-area">Skill area</label>
        <select id="cal-skill-area" bind:value={skillAreaFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any</option>
          {#each allSkillAreas as skillArea}
            <option value={skillArea}>{skillArea}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500" for="cal-tool">Tool</label>
        <select id="cal-tool" bind:value={toolFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any</option>
          {#each allTools as tool}
            <option value={tool}>{tool}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500" for="cal-major">Major</label>
        <select id="cal-major" bind:value={majorFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any</option>
          {#each allMajors as major}
            <option value={major}>{major}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500" for="cal-course">Course</label>
        <select id="cal-course" bind:value={courseFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any</option>
          {#each allCourses as course}
            <option value={course}>{course}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <label class="text-xs font-medium text-slate-500" for="cal-language">Language</label>
        <select id="cal-language" bind:value={languageFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
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
    </div>
    <div class="flex gap-4 text-xs text-slate-500">
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-davidson-red"></span> In-person</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-lake-blue"></span> Virtual</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-cool-gray-6"></span> Booked</span>
    </div>
  {/if}

  <div bind:this={calendarEl} class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"></div>
</div>
