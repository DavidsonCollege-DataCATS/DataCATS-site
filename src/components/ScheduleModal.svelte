<script>
  import { fade, scale } from 'svelte/transition';

  export let open = false;
  export let zoomSchedulerUrl = '';
  export let consultantName = '';
  export let slot = null; // { start: Date, end: Date }
  export let onClose = () => {};

  function formatSlot(s) {
    if (!s) return '';
    const opts = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return `${new Date(s.start).toLocaleString(undefined, opts)} – ${new Date(s.end).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  function handleBackdropKeydown(event) {
    if (event.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleBackdropKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    transition:fade={{ duration: 150 }}
    on:click={onClose}
    role="presentation"
  >
    <div
      class="w-full max-w-[800px] rounded-xl bg-white p-5 shadow-xl"
      transition:scale={{ duration: 150, start: 0.96 }}
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-label={`Schedule with ${consultantName}`}
    >
      <div class="mb-3 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Book time with {consultantName}</h2>
          {#if slot}
            <p class="text-sm text-slate-500">{formatSlot(slot)}</p>
          {/if}
        </div>
        <button
          on:click={onClose}
          class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <iframe
        src={`${zoomSchedulerUrl}?embed=true`}
        title={`Zoom Scheduler for ${consultantName}`}
        frameborder="0"
        style="width: 100%; height: 560px;"
      ></iframe>
    </div>
  </div>
{/if}
