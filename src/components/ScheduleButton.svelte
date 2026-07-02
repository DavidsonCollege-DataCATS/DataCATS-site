<script>
  import ScheduleModal from './ScheduleModal.svelte';

  export let consultantName = '';
  export let zoomSchedulerUrl = '';

  let modalOpen = false;
</script>

{#if zoomSchedulerUrl}
  <button
    on:click={() => (modalOpen = true)}
    class="mt-4 block w-full rounded-md bg-davidson-red px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-davidson-red-deep"
  >
    Schedule an Appointment
  </button>

  <ScheduleModal
    open={modalOpen}
    {zoomSchedulerUrl}
    {consultantName}
    slot={null}
    onClose={() => (modalOpen = false)}
  />
{/if}
