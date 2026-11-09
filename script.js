document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".nav-item").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Contact form
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  if (contactForm && formStatus && submitBtn) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        subject: String(formData.get("subject") || "").trim(),
        message: String(formData.get("message") || "").trim()
      };

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!payload.name || !payload.email || !payload.subject || !payload.message) {
        showStatus("Please fill in all fields.", "error");
        return;
      }
      if (!emailPattern.test(payload.email)) {
        showStatus("Please enter a valid email address.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      showStatus("Sending your message...", "pending");

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success !== true) {
          throw new Error(result.message || `Request failed (HTTP ${response.status}).`);
        }

        showStatus(result.message || "Message sent successfully!", "success");
        contactForm.reset();
      } catch (error) {
        console.error("Contact form error:", error);
        showStatus(error.message || "Unable to send your message. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      }
    });
  }

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  }

  // Scroll reveal and subtle 3D tilt
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(
    ".section-header, .about-grid > *, .skill-category, .project-card, .timeline-item, .contact-grid > *"
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${(index % 4) * 80}ms`;
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(
    ".about-card, .stats-card, .skill-category, .project-card, .timeline-content, .contact-info, .contact-form"
  ).forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.transform =
        `perspective(1000px) rotateX(${(0.5 - y) * 6}deg) ` +
        `rotateY(${(x - 0.5) * 6}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
});
