<script>
  import TeamCalendar from './TeamCalendar.svelte';
  import ScheduleModal from './ScheduleModal.svelte';

  export let events = [];
  export let recurringEvents = [];
  export let consultantName = '';
  export let zoomSchedulerUrl = '';

  let modalOpen = false;
  let selectedSlot = null;

  function handleSlotClick(slot) {
    if (!zoomSchedulerUrl) return;
    selectedSlot = slot;
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }
</script>

<TeamCalendar {events} {recurringEvents} consultants={[]} onSlotClick={handleSlotClick} />

<ScheduleModal
  open={modalOpen}
  {zoomSchedulerUrl}
  {consultantName}
  slot={selectedSlot}
  onClose={closeModal}
/>
