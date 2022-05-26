import { getElement, setTextValue } from '../../utils/ts/helpers';
import { Modal } from '../../interfaces/Modal.interface';

export class ModalResult implements Modal {
  modal: HTMLElement;

  id: string;

  private result: string;

  private value: number;

  private pts: number;

  private interval: any;

  fillModal(modalId, result, value, state) {
    console.log(state);
    this.result = result;
    this.value = value;
    this.pts = state.userPts;
    this.id = modalId;
    setTextValue('modalStart', this.pts.toString());
    setTextValue('modalWord', state.word);
    this.openModal();
  }

  openModal() {
    this.modal = <HTMLElement>getElement(this.id);
    this.modal.classList.add('modal_active');
    this.counter();
  }

  closeModal() {
    this.modal.classList.remove('modal_active');
    clearInterval(this.interval);
    this.clearModal();
  }

  clearModal() {
    setTextValue('modalTitle', '');
    setTextValue('modalStart', '0000');
    setTextValue('modalCounter', '0000');
    setTextValue('modalResult', '');
  }

  counter() {
    const counter = <HTMLElement>getElement('modalCounter');
    const result = <HTMLElement>getElement('modalResult');
    const title = <HTMLElement>getElement('modalTitle');
    const time = 1500;
    let step;
    let currentPts = this.pts;
    let nextPts;
    let difference;

    if (this.result === 'win') {
      title.innerText = 'Победа';
      result.innerText = `+${this.value}`;
      result.style.color = '#208a28';
      step = 1;
      nextPts = currentPts + this.value;
      difference = nextPts - currentPts;
    }

    if (this.result === 'loose') {
      title.innerText = 'Поражение';
      result.innerText = `-${this.value}`;
      result.style.color = '#b71f1f';
      step = -1;
      nextPts = currentPts - this.value;
      difference = currentPts - nextPts;
    }

    const intervalPeriod = Math.round(time / (difference / 1));
    result.classList.add('modal__result_active');
    this.interval = setInterval(() => {
      currentPts += step;
      if (currentPts === nextPts) {
        clearInterval(this.interval);
        counter.style.color = '#000000';
        result.classList.remove('modal__result_active');
      }
      counter.innerText = currentPts.toString();
    }, intervalPeriod);
  }
}
