// Helper to safely set text with a fallback
function setTextOrFallback(elementId, value, fallback) {
  const el = document.getElementById(elementId);
  const text = value.trim();
  el.textContent = text || fallback;
}

// Turn textarea lines into <li> list
function setListFromLines(elementId, value, fallbackItems) {
  const el = document.getElementById(elementId);
  el.innerHTML = "";

  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const items = lines.length ? lines : fallbackItems;

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.appendChild(li);
  });
}

// Turn comma-separated skills into <li>
function setListFromCommaSeparated(elementId, value, fallbackItems) {
  const el = document.getElementById(elementId);
  el.innerHTML = "";

  let skills = value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!skills.length) skills = fallbackItems;

  skills.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    el.appendChild(li);
  });
}

function updatePreview() {
  const fullName = document.getElementById("fullName").value || "";
  const jobTitle = document.getElementById("jobTitle").value || "";
  const email = document.getElementById("email").value || "";
  const phone = document.getElementById("phone").value || "";
  const address = document.getElementById("address").value || "";
  const website = document.getElementById("website").value || "";
  const summary = document.getElementById("summary").value || "";
  const skills = document.getElementById("skills").value || "";
  const experience = document.getElementById("experience").value || "";
  const education = document.getElementById("education").value || "";

  setTextOrFallback("preview-name", fullName, "Your Name");
  setTextOrFallback("preview-title", jobTitle, "Job Title");

  setTextOrFallback("preview-email", email, "you@example.com");
  setTextOrFallback("preview-phone", phone, "+91 00000 00000");
  setTextOrFallback("preview-address", address, "City, Country");
  setTextOrFallback("preview-website", website, "your-portfolio.com");

  setTextOrFallback(
    "preview-summary",
    summary,
    "A short professional summary will appear here. Describe your experience, strengths, and what you’re looking for."
  );

  setListFromCommaSeparated("preview-skills", skills, [
    "HTML",
    "CSS",
    "JavaScript",
  ]);

  setListFromLines("preview-experience", experience, [
    "Experience item 1",
    "Experience item 2",
  ]);

  setListFromLines("preview-education", education, [
    "Education item 1",
    "Education item 2",
  ]);
}

function clearForm() {
  document.getElementById("resume-form").reset();
  updatePreview();
}

function setupEvents() {
  const form = document.getElementById("resume-form");

  // Update on any input change
  form.addEventListener("input", updatePreview);

  const clearBtn = document.getElementById("clearBtn");
  clearBtn.addEventListener("click", clearForm);

  const printBtn = document.getElementById("printBtn");
  printBtn.addEventListener("click", () => {
    // Use browser’s print dialog, print stylesheet will only show resume
    window.print();
  });

  // Initial preview
  updatePreview();
}

document.addEventListener("DOMContentLoaded", setupEvents);
