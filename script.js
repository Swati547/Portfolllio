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

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = form.querySelector(".form-status");
        const submitButton = form.querySelector("button[type='submit']");
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        status.textContent = "Sending...";
        submitButton.disabled = true;

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to send your message.");
            }

            status.textContent = result.message;
            form.reset();
        } catch (error) {
            status.textContent = error.message || "Unable to send your message.";
        } finally {
            submitButton.disabled = false;
        }
    });
});
