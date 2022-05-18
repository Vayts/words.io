import '../../styles/main.scss';
import { getElement, addListener, getInputValue, setTextValue, getLocalStorageItem} from '../../../utils/ts/helpers';
import {changeGameValue, displayCounter, loadUserInfo, startGame} from './logic';
import { ModalResult } from '../../../components/Modal/modalResult';
import { ModalSettings } from '../../../components/Modal/modalSettings';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const state = {
    looseValue: null,
    winValue: null,
    tryCounter: null,
    lengthCounter: null,
    rowList: null,
    colList: null,
    currentRow: null,
    currentCol: null,
    firstLetter: null,
    word: null,
    userPts: null,
    modal: new ModalResult(),
    settings: new ModalSettings('settingsModal')
  };

  addListener('wordLengthInput', 'input', displayCounter.bind(null, state, 'wordLengthDisplay', 'wordLengthInput'));
  addListener('tryCounterInput', 'input', displayCounter.bind(null, state, 'tryCounterDisplay', 'tryCounterInput'));
  addListener('playButton', 'click', playGame.bind(null, state));
  addListener('settingsButton', 'click', startGame.bind(null, state));

  setTextValue('userName', getLocalStorageItem('username'));
  changeGameValue(state);
  loadUserInfo(state);
}

function playGame(state) {
  state.settings.openModal();
}

