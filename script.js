/**
 * SWISSO KAFFEE & HIMMEL KAFFEE — OFFICIAL SHOWCASE SCRIPT
 * Interactive catalog presentation, dynamic reviews with persistence, lightbox, and quiz.
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
  // TELEGRAM NOTIFICATIONS HELPER (Direct Telegram Bot API)
  // =========================================================================
  const TG_BOT_TOKEN = '8609509435:AAHk_JTwMB4uAMON3f9IL1ut641J1LfnX-Q';
  const TG_CHAT_ID = '1095520731';

  async function sendTelegramNotification(text) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      return data && data.ok;
    } catch (e) {
      console.warn('Telegram notification failed:', e);
      return false;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
  // CONSULTATION INQUIRY FORM (Sends Telegram Alert)
  // =========================================================================
  const consultationInquiryForm = document.getElementById('consultationInquiryForm');
  if (consultationInquiryForm) {
    consultationInquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiryName').value.trim();
      const phone = document.getElementById('inquiryPhone').value.trim();
      const topic = document.getElementById('inquiryTopic').value;
      const message = document.getElementById('inquiryMessage') ? document.getElementById('inquiryMessage').value.trim() : '';

      const submitBtn = consultationInquiryForm.querySelector('button[type="submit"]');
      const origHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Відправка...';

      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      let tgText = `☕ <b>НОВИЙ ЗАПИТ НА КОНСУЛЬТАЦІЮ!</b>\n\n`
                 + `👤 <b>Ім'я:</b> ${escapeHtml(name)}\n`
                 + `📞 <b>Телефон:</b> <code>${escapeHtml(phone)}</code>\n`
                 + `📋 <b>Категорія:</b> ${escapeHtml(topic)}\n`;
      if (message) {
        tgText += `💬 <b>Коментар:</b> ${escapeHtml(message)}\n`;
      }
      tgText += `\n🕒 <i>Час: ${timeStr} (Сайт bestcoffe.shop)</i>`;

      // 1. Надійна пряма відправка в Telegram
      await sendTelegramNotification(tgText);

      // 2. Додаткове збереження через серверне API (якщо увімкнено PHP)
      try {
        fetch('api/consultation.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, topic, message })
        }).catch(() => {});
      } catch (err) {}

      showToast(`Дякуємо, ${name}! Запит успішно надіслано. Наш експерт зв'яжеться з вами найближчим часом.`);
      consultationInquiryForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    });
  }

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
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      lightboxModal.classList.remove('active');
    }
  });

  // Navbar background change on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(12, 9, 8, 0.98)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.background = 'rgba(12, 9, 8, 0.92)';
      navbar.style.boxShadow = 'none';
    }
  });
});
