import {
  clearRow,
  disableKeyEvent,
  enableKeyEvent,
  getElement,
  getInputValue,
  getNodeList,
  getWord,
  highlightLetter,
  highlightWord,
  setErrorAnim, setTextValue,
} from '../../../utils/ts/helpers';
import 'core-js/es/reflect';
import 'regenerator-runtime/runtime';

export function getGameValue(wordLength, tryCounter): [number, number] {
  const winValue = wordLength * 8 - tryCounter * 3;
  const looseValue = Math.floor(winValue * 0.8);
  return [winValue, looseValue];
}

export function changeGameValue(state) {
  const winCounter = <HTMLElement>getElement('winPtsCounter');
  const looseCounter = <HTMLElement>getElement('loosePtsCounter');
  const wordLengthDisplay = <HTMLElement>getElement('wordLengthDisplay');
  const tryCounterDisplay = <HTMLElement>getElement('tryCounterDisplay');
  const wordLengthValue = getInputValue('wordLengthInput');
  const tryCounterValue = getInputValue('tryCounterInput');
  wordLengthDisplay.innerText = wordLengthValue;
  tryCounterDisplay.innerText = tryCounterValue;
  const results = getGameValue(wordLengthValue, tryCounterValue);
  [state.winValue, state.looseValue] = results;
  looseCounter.innerText = String(results[1]);
  winCounter.innerText = String(results[0]);
  return state;
}

export function displayCounter(state, displayId, inputId): string {
  const display = <HTMLElement>getElement(displayId);
  display.innerText = getInputValue(inputId);
  changeGameValue(state);
  return display.textContent;
}

export function generateGameField(wordLength, tryCounter) {
  const dataFragment = document.createDocumentFragment();

  for (let i = 0; i < tryCounter; i += 1) {
    const tr = document.createElement('tr');
    tr.classList.add('gameplay__row');

    for (let m = 0; m < wordLength; m += 1) {
      const th = document.createElement('th');
      th.classList.add('gameplay__col');
      tr.append(th);
    }

    dataFragment.append(tr);
  }
  return dataFragment;
}

export function startGame(state) {
  const settings = <HTMLElement>getElement('settingsBlock');
  const gameplay = <HTMLElement>getElement('gameplayBlock');
  const table = <HTMLElement>getElement('gameplayTable');
  state.lengthCounter = getInputValue('wordLengthInput');
  state.tryCounter = getInputValue('tryCounterInput');
  settings.style.display = 'none';
  gameplay.style.display = 'flex';
  table.append(generateGameField(state.lengthCounter, state.tryCounter));
  fillState(state);
  generateWord(state);
  const func = (event) => {
    enterTheLetter(state, event, func);
  };

  document.addEventListener('keydown', func);
}

export function generateWord(state) {
  fetch(`http://localhost:3000/word/generate/${state.lengthCounter}`).then((value) => {});
}

function fillState(state) {
  state.rowList = getNodeList('.gameplay__row');
  state.colList = getNodeList('.gameplay__col');
  state.currentRow = 0;
  state.currentCol = 0;
  state.firstLetter = 0;
  state.rowList[state.currentRow].classList.add('active');
  return state;
}

async function checkWord(state): Promise<any> {
  const row = state.rowList[state.currentRow];
  const word = getWord(row);
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:3000/word/check`, {
      method: 'POST',
      body: JSON.stringify(word),
    })
      .then((response) => response.json())
      .then((value: any) => {
        if (value.message === 'WIN') {
          highlightWord(state);
          resolve('WIN');
        }
        if (value.message === 'WORD_DOESNT_EXIST') {
          reject('Error! Wrong word.');
        }
        if (value.message === 'WORD_EXIST') {
          highlightLetter(state, value.fullMatch, '#33944AFF');
          highlightLetter(state, value.partialMatch, '#d9cc3d');
          resolve('CONTINUE');
        }

        reject('Error!');
      });
  });
}

export function loadUserInfo() {
  console.log('aaaaaaaaaa');
  fetch('http://localhost:3000/user/pts')
    .then((data) => data.json())
    .then((response) => {
      console.log(response)
      setTextValue('userPts', response.pts)
    });
}

async function enterTheLetter(state, event, func): Promise<any> {
  const regEx = /[а-яА-ЯёЁ]/;

  if (event.key === 'Backspace') {
    removeLetter(state);
  }

  if (event.key.match(regEx)) {
    state.colList[state.currentCol].innerText = event.key.toUpperCase();
    state.currentCol += 1;

    if (state.currentCol % state.lengthCounter === 0) {
      checkWord(state)
        .then((value: string) => {
          if (value === 'WIN') {
            disableKeyEvent(func);
            return true;
          }

          if (Number(state.currentRow) !== state.tryCounter - 1) {
            state.currentRow += 1;
            state.firstLetter += Number(state.lengthCounter);
            state.rowList[state.currentRow].classList.add('active');
          }

          if (state.currentCol === state.lengthCounter * state.tryCounter) {
            disableKeyEvent(func);
          }
        })
        .catch(() => {
          disableKeyEvent(func);
          setErrorAnim(state.rowList[state.currentRow]);
          setTimeout(() => {
            clearRow(state.colList, state.firstLetter);
            state.currentCol = state.firstLetter;
            enableKeyEvent(func);
          }, 450);
        });
    }
  }
  return true;
}

function removeLetter(state) {
  const previousLetter = state.currentCol - 1;
  if (previousLetter >= state.firstLetter) {
    state.colList[previousLetter].innerText = '';
    state.currentCol = previousLetter;
    return true;
  }
  return false;
}

function gameWin() {}

function gameLoose() {}
