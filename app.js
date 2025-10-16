document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("application-form");
  const toast = document.querySelector(".toast");
  const overlay = document.querySelector(".overlay");
  const loadingCard = document.querySelector(".overlay-loading");
  const successCard = document.querySelector(".overlay-success");
  const overlayMessage = document.querySelector(".overlay-message");
  const overlayEmail = document.querySelector(".overlay-email");
  const submitButton = form?.querySelector("button[type='submit']");
  const shapes = document.querySelectorAll(".shape");

  let toastTimer;
  let loadingTimer;
  let hideOverlayTimer;
  const shapeTimers = new Map();

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const scheduleShapeMove = (shape) => {
    const range = Number(shape.dataset.range || 180);
    const baseRotate = Number(shape.dataset.rotate || 0);
    const baseScale = Number(shape.dataset.scale || 1);

    const targetX = randomBetween(-range, range);
    const targetY = randomBetween(-range, range);
    const targetScale = Math.max(0.65, Math.min(baseScale + randomBetween(-0.15, 0.18), 1.4));
    const targetRotate = baseRotate + randomBetween(-20, 20);
    const duration = randomBetween(7, 14);

    shape.style.transitionDuration = `${duration}s`;
    shape.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale}) rotate(${targetRotate}deg)`;

    const timerId = setTimeout(() => scheduleShapeMove(shape), duration * 1000);
    shapeTimers.set(shape, timerId);
  };

  if (shapes.length) {
    shapes.forEach((shape) => {
      const baseRotate = Number(shape.dataset.rotate || 0);
      const baseScale = Number(shape.dataset.scale || 1);
      const initialDuration = randomBetween(6, 10);

      shape.style.transitionProperty = "transform";
      shape.style.transitionTimingFunction = "cubic-bezier(0.22, 0.61, 0.36, 1)";
      shape.style.transitionDuration = `${initialDuration}s`;
      shape.style.transform = `translate3d(0px, 0px, 0) scale(${baseScale}) rotate(${baseRotate}deg)`;

      const startDelay = randomBetween(120, 900);
      const timerId = setTimeout(() => scheduleShapeMove(shape), startDelay);
      shapeTimers.set(shape, timerId);
    });

    window.addEventListener("beforeunload", () => {
      shapeTimers.forEach((timerId) => clearTimeout(timerId));
      shapeTimers.clear();
    });
  }

  if (!form || !toast || !overlay || !loadingCard || !successCard || !overlayMessage || !overlayEmail) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const rawName = (data.get("fullName") || "").toString().trim();
    const rawEmail = (data.get("email") || "").toString().trim();
    const displayName = rawName || "Applicant";

    overlayMessage.textContent = "";
    const strongName = document.createElement("strong");
    strongName.textContent = displayName;
    overlayMessage.append("Thank you, ", strongName, ".");
    overlayMessage.append(document.createElement("br"), "Your EU citizenship application has been submitted.");

    if (rawEmail) {
      overlayEmail.textContent = `We will contact you at ${rawEmail}.`;
    } else {
      overlayEmail.textContent = "We will contact you soon with more details.";
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    overlay.classList.add("is-visible");
    overlay.setAttribute("aria-hidden", "false");
    loadingCard.classList.add("is-active");
    successCard.classList.remove("is-active");

    clearTimeout(loadingTimer);
    clearTimeout(hideOverlayTimer);
    clearTimeout(toastTimer);

    loadingTimer = setTimeout(() => {
      loadingCard.classList.remove("is-active");
      successCard.classList.add("is-active");

      toast.textContent = `${displayName}, your application was sent!`;
      toast.setAttribute("aria-hidden", "false");
      toast.classList.add("show");

      toastTimer = setTimeout(() => {
        toast.classList.remove("show");
        toast.setAttribute("aria-hidden", "true");
      }, 2800);

      form.reset();
    }, 1500);

    hideOverlayTimer = setTimeout(() => {
      overlay.classList.remove("is-visible");
      overlay.setAttribute("aria-hidden", "true");
      successCard.classList.remove("is-active");

      if (submitButton) {
        submitButton.disabled = false;
      }
    }, 5200);
  });
});
