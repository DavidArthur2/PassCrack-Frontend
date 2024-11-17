import Swal from 'sweetalert2';

export default {
  showError(text) {
    Swal.fire({
      title: 'Hiba',
      text: text,
      icon: 'error',
      confirmButtonText: 'Értem'
    });
  },
  showInfo(text) {
    Swal.fire({
      title: 'Információ',
      text: text,
      icon: 'info',
      confirmButtonText: 'Rendben'
    });
  },
  showSuccess(text) {
    Swal.fire({
      title: 'Sikeres',
      text: text,
      icon: 'success',
      confirmButtonText: 'Rendben'
    });
  }
};
