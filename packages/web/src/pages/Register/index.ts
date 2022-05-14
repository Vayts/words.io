import '../styles/register-login.scss';
import { addListener, makeLabelPosition, removeChild } from '../../utils/ts/helpers';

import {
  generateValidationList,
  removeValidationList,
  validateConfirmPassword,
  validateLogin,
  validatePassword,
} from '../../utils/ts/validation';
import {collectRegisterData} from "./logic";

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const confirmPasswordRules: string[] = [
    'От 8 символов',
    'Специальный символ',
    'Цифра',
    'Только латиница',
    'Пароли совпадают',
  ];
  const passwordRules: string[] = ['От 8 символов', 'Специальный символ', 'Цифра', 'Только латиница'];
  const loginRules: string[] = ['5 - 20 символов', 'Только латиница и цифры'];

  addListener('registerForm', 'input', makeLabelPosition);
  addListener('registerForm', 'blur', removeChild.bind(null, 'validationList'));
  // ЛОГИН

  addListener('registerLogin', 'blur', removeValidationList);
  addListener(
    'registerLogin',
    'input',
    generateValidationList.bind(null, validateLogin, 'registerLogin', loginRules, 'validationList'),
  );
  addListener(
    'registerLogin',
    'focus',
    generateValidationList.bind(null, validateLogin, 'registerLogin', loginRules, 'validationList'),
  );

  // ПАРОЛЬ

  addListener('registerPassword', 'blur', removeValidationList);
  addListener(
    'registerPassword',
    'focus',
    generateValidationList.bind(null, validatePassword, 'registerPassword', passwordRules, 'validationList'),
  );
  addListener(
    'registerPassword',
    'input',
    generateValidationList.bind(null, validatePassword, 'registerPassword', passwordRules, 'validationList'),
  );

  // ПОДТВЕРДИТЬ ПАРОЛЬ

  addListener('registerConfirmPassword', 'blur', removeValidationList);
  addListener(
    'registerConfirmPassword',
    'focus',
    generateValidationList.bind(
      null,
      validateConfirmPassword,
      'registerConfirmPassword',
      confirmPasswordRules,
      'validationList',
    ),
  );
  addListener(
    'registerConfirmPassword',
    'input',
    generateValidationList.bind(
      null,
      validateConfirmPassword,
      'registerConfirmPassword',
      confirmPasswordRules,
      'validationList',
    ),
  );

  // ОТПРАВИТЬ

  addListener('registerButton', 'click', collectRegisterData);
}
