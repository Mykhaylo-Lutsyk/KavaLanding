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

  // Add review submission
  if (addReviewForm) {
    addReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('reviewAuthorName').value.trim();
      const variety = document.getElementById('reviewCoffeeSelect').value;
      const text = document.getElementById('reviewCommentText').value.trim();
      const rating = parseInt(reviewRatingInput.value, 10) || 5;

      if (!author || !text) {
        showToast('Будь ласка, заповніть всі обов\'язкові поля!');
        return;
      }

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

      const newReview = {
        author,
        variety,
        text,
        rating,
        date: formattedDate
      };

      reviews.unshift(newReview);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
      } catch (e) {}

      renderReviews();
      addReviewForm.reset();
      // Reset stars to 5
      if (starRatingSelect && reviewRatingInput) {
        reviewRatingInput.value = 5;
        starRatingSelect.querySelectorAll('i').forEach(s => s.classList.add('active'));
      }

      showToast(`Дякуємо, ${author}! Ваш відгук успішно опубліковано.`);
    });
  }

  // Initial render of reviews (empty by default)
  renderReviews();

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
  // CONSULTATION INQUIRY FORM
  // =========================================================================
  const consultationInquiryForm = document.getElementById('consultationInquiryForm');
  if (consultationInquiryForm) {
    consultationInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiryName').value.trim();
      const topic = document.getElementById('inquiryTopic').value;

      consultationInquiryForm.reset();
      showToast(`Дякуємо, ${name}! Запит на тему «${topic}» надіслано. Наш експерт зв'яжеться з вами найближчим часом.`);
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
