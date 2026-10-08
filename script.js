/**
 * SWISSO KAFFEE & HIMMEL KAFFEE — OFFICIAL SHOWCASE SCRIPT
 * Interactive catalog presentation, lightbox, quiz, and consultation form.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // TOAST NOTIFICATION
  // =========================================================================
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastNotification) return;
    toastMessage.textContent = msg;
    toastNotification.classList.add('active');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 3500);
  }

  // =========================================================================
  // MOBILE NAVIGATION TOGGLE
  // =========================================================================
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      const icon = mobileMenuToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('mobile-active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }


  // =========================================================================
  // COFFEE QUIZ INTERACTION
  // =========================================================================
  const quizOptionCards = document.querySelectorAll('.quiz-option-card');
  const quizResultBox = document.getElementById('quizResultBox');
  const quizResultText = document.getElementById('quizResultText');
  const quizScrollBtn = document.getElementById('quizScrollBtn');

  quizOptionCards.forEach(card => {
    card.addEventListener('click', () => {
      quizOptionCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const answer = card.getAttribute('data-answer');
      if (quizResultBox) quizResultBox.style.display = 'block';

      if (answer === 'beans') {
        quizResultText.innerHTML = `Вам найкраще підійде <strong>Swisso Barista 100% Arabica</strong> або <strong>Swisso Crema</strong> — цільні зерна для розкриття максимального багатства свіжої кави!`;
        if (quizScrollBtn) quizScrollBtn.setAttribute('href', '#zernova-kava');
      } else if (answer === 'ground') {
        quizResultText.innerHTML = `Ваш ідеальний вибір — <strong>Swisso Mild Gemahlen (500г)</strong>: досконалий помел для гейзера або турки з ніжними квітково-медовими нотками.`;
        if (quizScrollBtn) quizScrollBtn.setAttribute('href', '#melena-kava');
      } else if (answer === 'instant') {
        quizResultText.innerHTML = `Рекомендуємо спробувати <strong>Swisso Barista Gefriergetrocknet (200г)</strong> або наше фірмове <strong>Cappuccino Amaretto чи Dubai Schokolade (1 кг)</strong>!`;
        if (quizScrollBtn) quizScrollBtn.setAttribute('href', '#kapucino');
      }
    });
  });

  // =========================================================================
  // SUCCESS MODAL & TOAST HANDLERS (AGENT_RULES Rule 2)
  // =========================================================================
  const successModal = document.getElementById('successModal');
  const successModalDesc = document.getElementById('successModalDesc');

  function showSuccessModal(name) {
    if (successModal) {
      if (successModalDesc) {
        successModalDesc.textContent = `Дякуємо, ${name || 'шановний клієнте'}! Ваш запит успішно отримано. Наш експерт зв'яжеться з вами протягом 15 хвилин для надання консультації.`;
      }
      successModal.classList.add('active');
    } else {
      showToast(`Дякуємо, ${name}! Запит успішно надіслано. Наш експерт зв'яжеться з вами найближчим часом.`);
    }
  }

  window.closeSuccessModal = function(e) {
    if (!successModal) return;
    if (!e || e.target === successModal || e.target.classList.contains('btn-success-close')) {
      successModal.classList.remove('active');
    }
  };

  // =========================================================================
  // CONSULTATION INQUIRY FORM (Backend PHP → Telegram Bot)
  // Токен Telegram зберігається виключно на сервері в api/config.php
  // =========================================================================

  async function sendViaBackend(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('api/consultation.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  const inquiryForms = document.querySelectorAll('form.inquiry-form-layout, #consultationInquiryForm');

  inquiryForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('[name="name"], #inquiryName, input[type="text"]');
      const phoneInput = form.querySelector('[name="phone"], #inquiryPhone, input[type="tel"]');
      const topicInput = form.querySelector('[name="topic"], #inquiryTopic, select');
      const messageInput = form.querySelector('[name="message"], #inquiryMessage, textarea');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const topic = (topicInput && topicInput.value) ? topicInput.value : 'Загальна консультація / Допомога у виборі';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !phone) {
        showToast("Будь ласка, вкажіть ваше ім'я та номер телефону.");
        return;
      }

      // Regex-валідація формату телефону
      const phoneRegex = /^[\+]?[\d\s\(\)\-]{7,25}$/;
      if (!phoneRegex.test(phone)) {
        showToast('Введіть коректний номер телефону (наприклад: +38 (050) 123-45-67).');
        if (phoneInput) phoneInput.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const origHtml = submitBtn ? submitBtn.innerHTML : 'Надіслати';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Відправка...';
      }

      let isSuccess = false;

      // Відправка через серверний PHP API (/api/consultation.php)
      // Токен Telegram зберігається виключно на сервері
      const backendResult = await sendViaBackend({ name, phone, topic, message });
      if (backendResult && backendResult.success) {
        isSuccess = true;
      }

      if (isSuccess) {
        showSuccessModal(name);
        form.reset();
      } else {
        showToast('Не вдалося надіслати запит. Будь ласка, перевірте зв\'язок або зателефонуйте нам: +38 (0800) 33-55-77.');
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    });
  });

  // =========================================================================
  // FAQ ACCORDION
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // =========================================================================
  // LIGHTBOX MODAL (PHOTO ENLARGEMENT)
  // =========================================================================
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  window.openLightbox = function(src, caption) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Фото продукції Swisso Kaffee';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightboxModal.classList.add('active');
  };

  window.closeLightbox = function(e) {
    if (!lightboxModal) return;
    if (!e || e.target === lightboxModal || e.target.classList.contains('lightbox-close-btn')) {
      lightboxModal.classList.remove('active');
    }
  };

  // Keyboard close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightboxModal && lightboxModal.classList.contains('active')) {
        lightboxModal.classList.remove('active');
      }
      if (successModal && successModal.classList.contains('active')) {
        successModal.classList.remove('active');
      }
    }
  });

  // Navbar background change on scroll (throttled with rAF)
  const navbar = document.getElementById('navbar');
  let scrollTicking = false;
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.96)';
            navbar.style.boxShadow = '0 8px 30px rgba(60, 40, 25, 0.08)';
          } else {
            navbar.style.background = 'rgba(251, 249, 246, 0.94)';
            navbar.style.boxShadow = '0 2px 14px rgba(60, 40, 25, 0.04)';
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });
  }
});
