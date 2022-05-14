import '../styles/register-login.scss';
import { addListener, makeLabelPosition } from '../../utils/ts/helpers';
import { collectLoginInData } from './logic';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  addListener('loginInForm', 'input', makeLabelPosition);

  addListener('loginInButton', 'click', collectLoginInData);
}
