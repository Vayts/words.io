export interface Modal {
  id: string;
  modal: HTMLElement;
  openModal(): void;
  closeModal(): void;
}
