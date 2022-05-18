import { Modal } from '../../interfaces/Modal.interface';
import { getElement } from '../../utils/ts/helpers';

export class ModalSettings implements Modal {
  id: string;

  modal: HTMLElement;

  constructor(id) {
    this.id = id;
  }

  closeModal(): void {
    this.modal.classList.remove('modal_active');
    // clearInterval(this.interval);
    // this.clearModal();
  }

  openModal(): void {
    this.modal = <HTMLElement>getElement(this.id);
    this.modal.classList.add('modal_active');
  }

}
