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

  // =========================================================================
  // REVIEWS SYSTEM (EMPTY BY DEFAULT, ADDING PERSISTS IN LOCALSTORAGE)
  // =========================================================================
  const reviewsEmptyBox = document.getElementById('reviewsEmptyBox');
  const reviewsListContainer = document.getElementById('reviewsListContainer');
  const addReviewForm = document.getElementById('addReviewForm');
  const starRatingSelect = document.getElementById('starRatingSelect');
  const reviewRatingInput = document.getElementById('reviewRatingInput');

  const STORAGE_KEY = 'swisso_kaffee_user_reviews_v1';
  let reviews = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      reviews = JSON.parse(saved);
    }
  } catch (err) {
    reviews = [];
  }

  function renderReviews() {
    if (!reviewsListContainer || !reviewsEmptyBox) return;

    if (reviews.length === 0) {
      reviewsEmptyBox.style.display = 'block';
      reviewsListContainer.innerHTML = '';
      return;
    }

    reviewsEmptyBox.style.display = 'none';
    reviewsListContainer.innerHTML = reviews.map((rev) => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rev.rating) {
          starsHtml += '<i class="fa-solid fa-star"></i> ';
        } else {
          starsHtml += '<i class="fa-regular fa-star"></i> ';
        }
      }

      return `
        <div class="review-item-card">
          <div class="review-card-top">
            <div>
              <span class="review-author-name">${escapeHtml(rev.author)}</span>
              <span class="review-coffee-variety">${escapeHtml(rev.variety)}</span>
            </div>
            <div class="review-stars-row">
              ${starsHtml}
            </div>
          </div>
          <p class="review-card-text">«${escapeHtml(rev.text)}»</p>
          <div class="review-date-meta">Додано: ${rev.date}</div>
        </div>
      `;
    }).join('');
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

  // Star rating selector logic
  if (starRatingSelect && reviewRatingInput) {
    const stars = starRatingSelect.querySelectorAll('i');
    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.getAttribute('data-rating'), 10);
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-rating'), 10);
          if (sVal <= val) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });

      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-rating'), 10);
        reviewRatingInput.value = val;
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-rating'), 10);
          if (sVal <= val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  }

  // Initial reviews loading from data/reviews.json (Always works even without PHP)
  async function loadReviews() {
    try {
      const res = await fetch('data/reviews.json?t=' + Date.now());
      if (res.ok) {
        const serverReviews = await res.json();
        if (Array.isArray(serverReviews) && serverReviews.length > 0) {
          const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const map = new Map();
          // Додаємо локальні відгуки користувача
          localSaved.forEach(r => map.set(r.id || (r.author + r.text), r));
          // Додаємо спільні відгуки з сервера
          serverReviews.forEach(r => map.set(r.id || (r.author + r.text), r));
          reviews = Array.from(map.values());
          renderReviews();
          return;
        }
      }
    } catch (e) {
      console.log('Using local reviews fallback:', e);
    }
    renderReviews();
  }

  // Add review submission
  if (addReviewForm) {
    addReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = document.getElementById('reviewAuthorName').value.trim();
      const variety = document.getElementById('reviewCoffeeSelect').value;
      const text = document.getElementById('reviewCommentText').value.trim();
      const rating = parseInt(reviewRatingInput.value, 10) || 5;

      if (!author || !text) {
        showToast('Будь ласка, заповніть всі обов\'язкові поля!');
        return;
      }

      const submitBtn = addReviewForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Публікація...';

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

      const newReview = {
        id: 'rev_' + Date.now(),
        author,
        variety,
        text,
        rating,
        date: formattedDate
      };

      // 1. Одразу додаємо до поточного списку відгуків на сторінці
      reviews.unshift(newReview);

      // 2. Зберігаємо локально в браузері
      try {
        const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        localSaved.unshift(newReview);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localSaved));
      } catch (e) {}

      // 3. Миттєво перерендеримо блок відгуків (відгук одразу видно на сторінці!)
      renderReviews();
      addReviewForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;

      // Скидаємо зірочки до 5
      if (starRatingSelect && reviewRatingInput) {
        reviewRatingInput.value = 5;
        starRatingSelect.querySelectorAll('i').forEach(s => s.classList.add('active'));
      }

      // 4. Відправляємо сповіщення про новий відгук у ваш Telegram
      const starsStr = '⭐'.repeat(rating);
      const tgReviewMsg = `🌟 <b>НОВИЙ ВІДГУК НА САЙТІ!</b>\n\n`
                        + `👤 <b>Автор:</b> ${escapeHtml(author)}\n`
                        + `☕ <b>Сорт:</b> ${escapeHtml(variety)}\n`
                        + `⭐ <b>Оцінка:</b> ${starsStr} (${rating}/5)\n`
                        + `💬 <b>Відгук:</b>\n<i>"${escapeHtml(text)}"</i>`;
      sendTelegramNotification(tgReviewMsg);

      // 5. Також робимо спробу зберегти на сервері
      fetch('api/reviews.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      }).catch(() => {});

      showToast(`Дякуємо, ${author}! Ваш відгук успішно опубліковано.`);
    });
  }

  // Load reviews on startup
  loadReviews();

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
