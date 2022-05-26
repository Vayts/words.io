import { Modal } from '../../interfaces/Modal.interface';
import { addListener, getElement } from '../../utils/ts/helpers';

export class ModalSettings implements Modal {
  id: string;

  modal: HTMLElement;

  constructor(id) {
    this.id = id;
    addListener('closeSettingsModal', 'click', this.closeModal.bind(this));
  }

  closeModal(): void {
    this.modal.classList.remove('modal_active');
  }

  openModal(): void {
    this.modal = <HTMLElement>getElement(this.id);
    this.modal.classList.add('modal_active');
  }

}
