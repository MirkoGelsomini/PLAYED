import Toastify from 'toastify-js';

const baseOptions = {
  duration: 3500,
  close: true,
  gravity: 'top',
  position: 'right',
  stopOnFocus: true,
  offset: { x: 20, y: 20 },
};

const show = (text, type = 'info') => {
  Toastify({
    text,
    className: `toastify-played toast-${type}`,
    ...baseOptions,
  }).showToast();
};

export const toastSuccess = (text) => show(text, 'success');
export const toastError = (text) => show(text, 'error');
export const toastInfo = (text) => show(text, 'info');

export default {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
};


