
document.addEventListener('DOMContentLoaded', () => {

  // =====================================
  // 1. Mobile Navigation Toggle
  // =====================================

  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close navigation after clicking a link
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // =====================================
  // 2. Contact Form - Send Email
  // =====================================

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!contactForm || !formStatus || !submitBtn) {
    console.error('Contact form elements were not found.');
    return;
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form values
    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const subject = document.getElementById('subject')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

    // Validate required fields
    if (!name || !email || !subject || !message) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Please fill in all fields.';
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Please enter a valid email address.';
      return;
    }

    // Prevent duplicate submissions
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    formStatus.className = 'form-status';
    formStatus.textContent = 'Sending your message...';

    try {
      // Send data to the Express backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message
        })
      });

      // Read the response safely
      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          console.error(
            'Invalid server response:',
            response.status,
            responseText
          );

          throw new Error(
            `Server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      // Handle HTTP errors, including 404 and 405
      if (!response.ok) {
        if (response.status === 405) {
          throw new Error(
            'The server does not allow this request. Open your portfolio through http://localhost:3000 and ensure the Express backend is running.'
          );
        }

        throw new Error(
          result.message ||
          `Request failed with status ${response.status}.`
        );
      }

      // Confirm backend success
      if (result.success !== true) {
        throw new Error(
          result.message || 'The server could not send your message.'
        );
      }

      // Display success
      formStatus.className = 'form-status success';
      formStatus.textContent =
        result.message || 'Your message was sent successfully!';

      // Clear form only after success
      contactForm.reset();

    } catch (error) {
      console.error('Contact form error:', error);

      formStatus.className = 'form-status error';
      formStatus.textContent =
        error.message ||
        'Unable to send your message. Please try again later.';

    } finally {
      // Restore the submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-paper-plane"></i> Send Message';
    }
  });

});



/* =========================================
   3D TILT + SCROLL REVEAL
   Add after your existing script.js code
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Reveal sections and cards as they enter the viewport
  const revealItems = document.querySelectorAll(
    ".section-header, .about-grid > *, .skill-category, " +
    ".project-card, .timeline-item, .contact-grid > *"
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${(index % 4) * 80}ms`;
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Mouse-following 3D tilt on desktop
  if (reduceMotion || window.matchMedia("(hover: none)").matches) {
    return;
  }

  const cards = document.querySelectorAll(
    ".about-card, .stats-card, .skill-category, " +
    ".project-card, .timeline-content, .contact-info, .contact-form"
  );

  cards.forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 8;
      const rotateX = (0.5 - y) * 8;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) ` +
        `rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
});
