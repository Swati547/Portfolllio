document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".logo");
    const heroSection = document.querySelector(".hero");
    const heroTitle = document.querySelector(".hero-content h1 span");
    const heroEyebrow = document.querySelector(".hero-content .eyebrow");
    const emailLink = document.querySelector(".contact-panel a[href^='mailto:']");
    const contactList = document.querySelector(".contact-panel ul");
    const footerText = document.querySelector("footer p");
    const form = document.querySelector(".contact-form");
    const revealItems = document.querySelectorAll(
        ".about, .projects, .skills, .contact, .project-card, .skill-card"
    );

    revealItems.forEach((item, index) => {
        item.classList.add("reveal");
        item.style.setProperty("--reveal-delay", `${(index % 3) * 100}ms`);
    });

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    logo.textContent = "Swati Sharma";
    heroEyebrow.textContent = "Full Stack Developer";
    heroTitle.textContent = "Swati Sharma";
    emailLink.textContent = "swati2005barbiesharma@gmail.com";
    emailLink.href = "mailto:swati2005barbiesharma@gmail.com";

    const phoneItem = document.createElement("li");
    phoneItem.textContent = "Phone: 8219847074";
    contactList.insertBefore(phoneItem, contactList.children[1] || null);

    footerText.textContent = `© ${new Date().getFullYear()} Swati Sharma. Built with HTML, CSS, and JavaScript.`;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = form.querySelector("input[type='text']").value.trim();
        alert(`Thank you, ${name || "there"}! Your message has been received. I will contact you soon.`);
        form.reset();
    });
});
