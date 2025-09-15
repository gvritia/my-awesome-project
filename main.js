document.addEventListener("DOMContentLoaded", function () {
  const dlg = document.getElementById("contactDialog");
  const openBtn = document.getElementById("openDialog");
  const closeBtn = document.getElementById("closeDialog");
  const form = document.getElementById("contactForm");
  const phone = document.getElementById("phone");
  const phoneError = document.getElementById("phoneError");

  if (!phone) return;

  // Новые элементы для уведомлений
  const notificationDialog = document.getElementById("notificationDialog");
  const notificationMessage = document.getElementById("notificationMessage");
  const closeNotification = document.getElementById("closeNotification");

  let lastActive = null;

  // Улучшенная функция форматирования телефона
  function formatPhoneNumber() {
    let digits = phone.value.replace(/\D/g, "");

    // Если номер начинается с 8, заменяем на +7
    if (digits.startsWith("8") && digits.length <= 11) {
      digits = "7" + digits.slice(1);
    }

    // Если начинается с 7, но без +7
    if (
      digits.startsWith("7") &&
      !phone.value.startsWith("+7") &&
      digits.length <= 11
    ) {
      digits = "7" + digits.slice(1);
    }

    // Ограничиваем до 11 цифр (российский номер)
    digits = digits.slice(0, 11);

    if (digits.length === 0) {
      phone.value = "";
      return;
    }

    // Форматируем по маске: +7 (XXX) XXX-XX-XX
    let formattedValue = "+7";

    if (digits.length > 1) {
      formattedValue += ` (${digits.slice(1, 4)}`;
    }

    if (digits.length >= 4) {
      formattedValue += ") ";
    }

    if (digits.length >= 5) {
      formattedValue += digits.slice(4, 7);
    }

    if (digits.length >= 8) {
      formattedValue += `-${digits.slice(7, 9)}`;
    }

    if (digits.length >= 10) {
      formattedValue += `-${digits.slice(9, 11)}`;
    }

    phone.value = formattedValue;
  }

  // Валидация телефона
  function validatePhone() {
    const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    const isValid = phonePattern.test(phone.value);
    const isEmpty = phone.value.trim() === "";

    if (isEmpty) {
      phone.setCustomValidity(
        phone.dataset.requiredError || "Телефон обязателен для заполнения"
      );
      phoneError.textContent =
        phone.dataset.requiredError || "Телефон обязателен для заполнения";
      phone.setAttribute("aria-invalid", "true");
      return false;
    } else if (!isValid) {
      phone.setCustomValidity(
        phone.dataset.patternError ||
          "Номер должен быть в формате: +7 (900) 000-00-00"
      );
      phoneError.textContent =
        phone.dataset.patternError || "Проверьте формат номера телефона";
      phone.setAttribute("aria-invalid", "true");
      return false;
    } else {
      phone.setCustomValidity("");
      phoneError.textContent = "";
      phone.setAttribute("aria-invalid", "false");
      return true;
    }
  }

  // Обработчики событий для телефона
  phone.addEventListener("input", function () {
    formatPhoneNumber();

    // Сбрасываем ошибку при вводе, если формат правильный
    const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (phonePattern.test(phone.value)) {
      phone.setCustomValidity("");
      phoneError.textContent = "";
      phone.setAttribute("aria-invalid", "false");
    }
  });

  phone.addEventListener("blur", function () {
    validatePhone();
  });

  phone.addEventListener("keydown", function (e) {
    // Разрешаем: backspace, delete, tab, escape, enter
    if (
      [46, 8, 9, 27, 13].includes(e.keyCode) ||
      // Разрешаем: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Разрешаем: цифры, стрелки, home, end
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    // Запрещаем все остальное, если это не цифра
    if (
      (e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  });

  // Открытие основной модалки
  openBtn.addEventListener("click", () => {
    lastActive = document.activeElement;
    dlg.showModal();
    dlg.querySelector("input,select,textarea,button")?.focus();
  });

  // Закрытие основной модалки
  closeBtn.addEventListener("click", () => dlg.close("cancel"));

  // Закрытие уведомления
  closeNotification.addEventListener("click", () => {
    notificationDialog.close();
    lastActive?.focus();
  });

  // Обработка отправки формы
  form.addEventListener("submit", (e) => {
    // Сброс кастомных сообщений
    [...form.elements].forEach((el) => el.setCustomValidity?.(""));

    // Валидируем телефон отдельно
    const isPhoneValid = validatePhone();

    // Проверка валидности формы
    if (!form.checkValidity() || !isPhoneValid) {
      e.preventDefault();

      // Показ ошибок для email
      const email = form.elements.email;
      if (email?.validity.typeMismatch) {
        email.setCustomValidity(
          "Введите корректный e-mail, например name@example.com"
        );
      }

      form.reportValidity();

      // Добавление aria-invalid для проблемных полей
      [...form.elements].forEach((el) => {
        if (el.willValidate) {
          el.toggleAttribute("aria-invalid", !el.checkValidity());
        }
      });
      return;
    }

    // Успешная отправка
    e.preventDefault();

    // Закрываем основное диалоговое окно
    dlg.close();

    // Показываем уведомление об успешной отправке
    notificationMessage.textContent =
      "Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.";
    notificationDialog.showModal();

    // Очищаем форму
    form.reset();
  });

  // Восстановление фокуса при закрытии диалогов
  dlg.addEventListener("close", () => {
    lastActive?.focus();
  });

  notificationDialog.addEventListener("close", () => {
    lastActive?.focus();
  });
});