(function () {
  const timer = document.getElementById('timer');
  const hiddenTime = document.getElementById('time_seconds');
  if (timer) {
    let seconds = 0;
    setInterval(() => {
      seconds += 1;
      hiddenTime.value = seconds;
      const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
      const remainder = String(seconds % 60).padStart(2, '0');
      timer.textContent = `${minutes}:${remainder}`;
    }, 1000);
  }
  const answer = document.getElementById('answer');
  const status = document.getElementById('saved-status');
  if (answer && status) {
    answer.value = sessionStorage.getItem(`answer-${window.location.pathname}`) || '';
    answer.addEventListener('input', () => {
      sessionStorage.setItem(`answer-${window.location.pathname}`, answer.value);
      status.textContent = 'Saved just now';
      clearTimeout(window.saveTimer);
      window.saveTimer = setTimeout(() => { status.textContent = 'Autosaved locally'; }, 1200);
    });
    document.getElementById('answer-form').addEventListener('submit', () => {
      sessionStorage.removeItem(`answer-${window.location.pathname}`);
    });
  }
})();

const candidateSort = document.getElementById('candidateSort');
if (candidateSort) {
  candidateSort.addEventListener('change', () => {
    const table = document.getElementById('candidateTable');
    const rows = Array.from(table.querySelectorAll('.candidate-row'));
    const key = candidateSort.value;
    rows.sort((a, b) => {
      if (key === 'name') return a.dataset.name.localeCompare(b.dataset.name);
      return Number(b.dataset[key]) - Number(a.dataset[key]);
    });
    rows.forEach((row, index) => table.insertBefore(row, table.querySelector('.empty-state') || null));
  });
}
