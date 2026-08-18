(function () {
  'use strict';

  function initCalculator() {
    var calculator = document.getElementById('spell-points-calculator');
    if (!calculator) return;

    var rows = calculator.querySelector('[data-calculator-rows]');
    var addButton = calculator.querySelector('[data-add]');
    var error = calculator.querySelector('[data-calculator-error]');
    var result = calculator.querySelector('[data-calculator-result]');

    var spellPoints = [0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 94, 94, 107, 114, 123, 133];
    var maximumSpellLevels = ['—', '1st', '1st', '2nd', '2nd', '3rd', '3rd', '4th', '4th', '5th', '5th', '6th', '6th', '7th', '7th', '8th', '8th', '9th', '9th', '9th', '9th'];
    var pactPoints = [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4];
    var pactSpellLevels = ['—', '1st', '1st', '2nd', '2nd', '3rd', '3rd', '4th', '4th', '5th', '5th', '5th', '5th', '5th', '5th', '5th', '5th', '5th', '5th', '5th', '5th'];
    var progressions = {
      artificer: { label: 'Artificer', mode: 'half-up' },
      bard: { label: 'Bard', mode: 'full' },
      cleric: { label: 'Cleric', mode: 'full' },
      druid: { label: 'Druid', mode: 'full' },
      'eldritch-knight': { label: 'Fighter: Eldritch Knight', mode: 'third-up' },
      'arcane-trickster': { label: 'Rogue: Arcane Trickster', mode: 'third-up' },
      paladin: { label: 'Paladin', mode: 'half-down' },
      'profane-soul': { label: 'Blood Hunter: Profane Soul', mode: 'third-up' },
      ranger: { label: 'Ranger', mode: 'half-down' },
      sorcerer: { label: 'Sorcerer', mode: 'full' },
      warlock: { label: 'Warlock: Pact Magic', mode: 'pact-only' },
      wizard: { label: 'Wizard', mode: 'full' }
    };

    function rowTemplate() {
      var row = document.createElement('div');
      row.className = 'spell-points-calculator__row';
      row.setAttribute('data-class-row', '');
      row.innerHTML = '<label class="spell-points-calculator__field">' +
        '<span class="spell-points-calculator__label">Class</span><select data-class>' +
        '<option value="artificer">Artificer</option>' +
        '<option value="bard">Bard</option>' +
        '<option value="cleric">Cleric</option>' +
        '<option value="druid">Druid</option>' +
        '<option value="eldritch-knight">Fighter: Eldritch Knight</option>' +
        '<option value="arcane-trickster">Rogue: Arcane Trickster</option>' +
        '<option value="paladin">Paladin</option>' +
        '<option value="profane-soul">Blood Hunter: Profane Soul</option>' +
        '<option value="ranger">Ranger</option>' +
        '<option value="sorcerer">Sorcerer</option>' +
        '<option value="warlock">Warlock: Pact Magic</option>' +
        '<option value="wizard" selected>Wizard</option>' +
        '</select></label>' +
        '<div class="spell-points-calculator__field spell-points-calculator__field--level">' +
        '<span class="spell-points-calculator__label">Level</span>' +
        '<div class="spell-points-calculator__level-control">' +
        '<input type="number" min="1" max="20" value="1" inputmode="numeric" aria-label="Level" data-level>' +
        '<span class="spell-points-calculator__level-buttons">' +
        '<button type="button" data-level-adjust="up" aria-label="Increase level">↑</button>' +
        '<button type="button" data-level-adjust="down" aria-label="Decrease level">↓</button>' +
        '</span></div></div>' +
        '<button class="spell-points-calculator__remove" type="button" data-remove>Remove</button>';
      return row;
    }

    function effectiveLevel(level, mode) {
      if (mode === 'half-up') return Math.ceil(level / 2);
      if (mode === 'half-down') return Math.floor(level / 2);
      if (mode === 'third-up') return Math.ceil(level / 3);
      if (mode === 'pact-only') return 0;
      return level;
    }

    function setMessage(message) {
      error.textContent = message || '';
      error.hidden = !message;
    }

    function updateRemoveButtons() {
      var allRows = rows.querySelectorAll('[data-class-row]');
      allRows.forEach(function (row) {
        row.querySelector('[data-remove]').disabled = allRows.length === 1;
      });
    }

    function updateLevelButtons() {
      rows.querySelectorAll('[data-class-row]').forEach(function (row) {
        var level = Number(row.querySelector('[data-level]').value);
        row.querySelector('[data-level-adjust="up"]').disabled = level >= 20;
        row.querySelector('[data-level-adjust="down"]').disabled = level <= 1;
      });
    }

    function calculate() {
      var allRows = Array.from(rows.querySelectorAll('[data-class-row]'));
      var totalLevels = 0;
      var casterLevel = 0;
      var warlockLevel = 0;
      var breakdown = [];

      for (var i = 0; i < allRows.length; i += 1) {
        var classKey = allRows[i].querySelector('[data-class]').value;
        var levelInput = allRows[i].querySelector('[data-level]');
        var level = Number(levelInput.value);
        var classData = progressions[classKey];

        if (!Number.isInteger(level) || level < 1 || level > 20) {
          setMessage('Each class level must be a whole number from 1 to 20.');
          result.hidden = true;
          return;
        }

        totalLevels += level;
        if (classData.mode === 'pact-only') {
          warlockLevel += level;
          breakdown.push(classData.label + ' ' + level + ' (Pact Magic)');
        } else {
          var contribution = effectiveLevel(level, classData.mode);
          casterLevel += contribution;
          breakdown.push(classData.label + ' ' + level + ' (' + contribution + ')');
        }
      }

      if (totalLevels > 20) {
        setMessage('Your combined class levels cannot exceed 20.');
        result.hidden = true;
        return;
      }

      setMessage('');
      var metrics = [
        '<div class="spell-points-calculator__metric"><span>Class Levels</span><strong>' + totalLevels + '<small>/ 20</small></strong></div>',
        '<div class="spell-points-calculator__metric"><span>Spellcaster Level</span><strong>' + casterLevel + '</strong></div>',
        '<div class="spell-points-calculator__metric"><span>Spell Points</span><strong>' + spellPoints[casterLevel] + '</strong></div>',
        '<div class="spell-points-calculator__metric"><span>Maximum Spell Level</span><strong>' + maximumSpellLevels[casterLevel] + '</strong></div>'
      ];

      if (warlockLevel > 0) {
        metrics.push('<div class="spell-points-calculator__metric"><span>Pact Points</span><strong>' + pactPoints[warlockLevel] + '<small>max ' + pactSpellLevels[warlockLevel] + '</small></strong></div>');
      }

      result.innerHTML = '<div class="spell-points-calculator__metrics">' + metrics.join('') + '</div>' +
        '<p class="spell-points-calculator__breakdown"><span>Calculation</span>' + breakdown.join(' + ') + '</p>';
      result.hidden = false;
    }

    rows.addEventListener('click', function (event) {
      var removeButton = event.target.closest('[data-remove]');
      if (removeButton && !removeButton.disabled) {
        removeButton.closest('[data-class-row]').remove();
        updateRemoveButtons();
        updateLevelButtons();
        calculate();
        return;
      }

      var levelButton = event.target.closest('[data-level-adjust]');
      if (!levelButton || levelButton.disabled) return;
      var row = levelButton.closest('[data-class-row]');
      var levelInput = row.querySelector('[data-level]');
      var level = Number(levelInput.value) || 1;
      levelInput.value = levelButton.getAttribute('data-level-adjust') === 'up' ? level + 1 : level - 1;
      updateLevelButtons();
      calculate();
    });

    addButton.addEventListener('click', function () {
      rows.appendChild(rowTemplate());
      updateRemoveButtons();
      updateLevelButtons();
      calculate();
    });

    rows.addEventListener('change', calculate);
    rows.addEventListener('input', function () {
      updateLevelButtons();
      calculate();
    });
    updateRemoveButtons();
    updateLevelButtons();
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
}());
