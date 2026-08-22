document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".logo");
    const heroSection = document.querySelector(".hero");
    const heroTitle = document.querySelector(".hero-content h1 span");
    const heroEyebrow = document.querySelector(".hero-content .eyebrow");
    const emailLink = document.querySelector(".contact-panel a[href^='mailto:']");
    const contactList = document.querySelector(".contact-panel ul");
    const footerText = document.querySelector("footer p");
    const form = document.querySelector(".contact-form");

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
