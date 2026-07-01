<script>
  import { onMount, onDestroy } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import listPlugin from '@fullcalendar/list';
  import interactionPlugin from '@fullcalendar/interaction';

  /** @type {{slug: string, name: string, title: string, start: string, end: string, mode: string, status: string}[]} */
  export let events = [];
  /** @type {{slug: string, name: string, skills: string[], majorsForFilter: string[], coursework: string[], languages: string[]}[]} */
  export let consultants = [];
  /** Called with the clicked event when it's an open slot. Only used for individual (single-consultant) calendars. */
  export let onSlotClick = null;

  let calendarEl;
  let calendar;

  let tutorFilter = '';
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

  function consultantMatches(slug) {
    const c = consultants.find((x) => x.slug === slug);
    if (!c) return true;
    if (tutorFilter && slug !== tutorFilter) return false;
    if (skillFilter && !c.skills.includes(skillFilter)) return false;
    if (majorFilter && !c.majorsForFilter.includes(majorFilter)) return false;
    if (courseFilter && !c.coursework.includes(courseFilter)) return false;
    if (languageFilter && !c.languages.includes(languageFilter)) return false;
    return true;
  }

  $: visibleEvents = events
    .filter((e) => consultantMatches(e.slug))
    .map((e) => ({
      id: `${e.slug}-${e.start}`,
      title: consultants.length > 1 ? `${e.name} — ${e.title}` : e.title,
      start: e.start,
      end: e.end,
      backgroundColor: e.status === 'booked' ? '#cbd5e1' : e.mode === 'virtual' ? '#6366f1' : '#16a34a',
      borderColor: e.status === 'booked' ? '#cbd5e1' : e.mode === 'virtual' ? '#6366f1' : '#16a34a',
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
        <label class="text-xs font-medium text-slate-500" for="cal-skill">Skill</label>
        <select id="cal-skill" bind:value={skillFilter} class="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any</option>
          {#each allSkills as skill}
            <option value={skill}>{skill}</option>
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
    </div>
    <div class="flex gap-4 text-xs text-slate-500">
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-green-600"></span> In-person</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Virtual</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-slate-300"></span> Booked</span>
    </div>
  {/if}

  <div bind:this={calendarEl} class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"></div>
</div>
