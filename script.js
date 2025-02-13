document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for anchor links
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Tilt and subtle shine effect on project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Calculate rotation angles with a slightly gentler scale factor
      const rotateY = (x - centerX) / 10;
      const rotateX = -(y - centerY) / 10;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

      // Update the shine effect with lower intensity
      const shine = card.querySelector('.shine');
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
      if (angle < 0) angle += 360;
      shine.style.opacity = "1";
      shine.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.2) 0%, transparent 80%)`;
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      const shine = card.querySelector('.shine');
      shine.style.opacity = "0";
    });
  });

  // Lightbox modal functionality for gallery images
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-image");
  const captionText = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".close");

  const galleryItems = document.querySelectorAll(".gallery-item");
  galleryItems.forEach(item => {
    item.addEventListener("click", function () {
      modal.style.display = "block";
      modalImg.src = this.src;
      captionText.textContent = this.alt;
    });
  });

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Close modal when clicking outside the image
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
