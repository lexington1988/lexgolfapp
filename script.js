function deleteSelectedRound() {
  const select = document.getElementById('saved-rounds');
  const key = select.value;
  if (!key) return alert("Please select a round to delete.");

  if (confirm("Are you sure you want to delete this round?")) {
    localStorage.removeItem(key);
    updateRoundList();
    select.value = '';

    // Clear UI if the deleted round was currently loaded
    const current = localStorage.getItem('currentRound');
    if (current) {
      const currentData = JSON.parse(current);
      const deletedKey = `round-${currentData.courseName} - ${currentData.date}`;
      if (deletedKey === key) {
        clearUI();
        localStorage.removeItem('currentRound');
      }
    }

    alert("Round deleted.");
  }
}

function clearUI() {
  document.getElementById('course-select').value = '';
  ['p1-name', 'p2-name', 'p3-name', 'p4-name'].forEach(id => document.getElementById(id).value = '');

  // Reset scorecard column headers
  const headers = document.querySelectorAll('#scorecard thead tr th');
  headers[2].textContent = 'Player 1';
  headers[3].textContent = 'Player 2';
  headers[4].textContent = 'Player 3';
  headers[5].textContent = 'Player 4';

  // Do not clear clubs to retain persistent data
  // clubInputs().forEach(i => i.value = ''); // remove if you want to retain

  scoreInputs().forEach(i => i.value = '');
  logInputs().forEach(i => {
    if (i.tagName === 'SELECT') i.selectedIndex = 0;
    else i.value = '';
  });

  updateTotals();
  document.getElementById('course-select').focus();
}

function saveCurrentRound() {
  const round = collectData();
  if (!round.courseName.trim()) {
    alert("Please select a course before saving.");
    return;
  }
  const key = `${round.courseName} - ${round.date}`;
  localStorage.setItem(`round-${key}`, JSON.stringify(round));
  updateRoundList();
  alert(`Saved round: ${key}`);
}

function startNewRound() {
  if (confirm("Start a new round? This will clear all current inputs.")) {
    localStorage.removeItem('currentRound');
    clearUI();

    // 🔁 Re-populate club data from persistent storage
    const savedClubs = localStorage.getItem('persistentClubData');
    if (savedClubs) {
      populateClubData(JSON.parse(savedClubs));
    }

    // ✅ Reset Shot Tracker:
    resetShotTracker();
  }
}


function updateRoundList() {
  const select = document.getElementById('saved-rounds');
  select.innerHTML = '<option value="">🔽 Load Saved Round</option>';
  const keys = Object.keys(localStorage).filter(k => k.startsWith('round-')).sort();

  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));
    const player1Total = data.scorecardData?.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0) || 0;
    const player1Name = data.playerNames?.[0] || 'Player 1';
    const label = `${player1Total} - ${player1Name} - ${data.courseName} - ${data.date}`;

    const option = document.createElement('option');
    option.value = key;
    option.textContent = label; // safer than innerHTML for plain text
    select.appendChild(option);
  });
}
function resetShotTracker() {
  // ✅ Use the dedicated canvases container
  const canvasesContainer = document.getElementById('shot-tracker-canvases');
  if (canvasesContainer) {
    canvasesContainer.innerHTML = ''; // Clear only the canvases
  }

  holeCanvases.length = 0;

  // ✅ Recreate canvases for all 18 holes
  for (let i = 1; i <= 18; i++) {
    createShotCanvas(i);
  }
}


