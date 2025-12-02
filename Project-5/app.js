// Modular JS: responsive behavior + theme + bookings UI + overlay handling

const UI = (() => {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const providerSelect = qs("#providerSelect");
  const loadSlotsBtn = qs("#loadSlotsBtn");
  const refreshBtn = qs("#refreshBtn");
  const statProviders = qs("#statProviders");
  const statBookings = qs("#statBookings");
  const statClock = qs("#statClock");
  const mobileClock = qs("#mobileClock");
  const slotsGrid = qs("#slotsGrid");
  const slotsHeadline = qs("#slotsHeadline");
  const bookingsList = qs("#bookingsList");
  const recentList = qs("#recentList");
  const clearBookingsBtn = qs("#clearBookingsBtn");
  const themeToggle = qs("#themeToggle");
  const themeIcon = qs("#themeIcon");
  const themeToggleMobile = qs("#themeToggleMobile");
  const themeIconMobile = qs("#themeIconMobile");

  const mobileMenuBtn = qs("#mobileMenuBtn");
  const sidebar = qs("#sidebar");
  const overlay = qs("#overlay");

  const navBtns = qsa(".nav-btn");
  const panels = {
    search: qs("#section-search"),
    bookings: qs("#section-bookings"),
  };

  let providers = [];
  let bookings = JSON.parse(localStorage.getItem("qs_bookings") || "[]");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("qs_theme", theme);
    if (theme === "light") {
      themeIcon.className = "bi bi-sun";
      themeIconMobile && (themeIconMobile.className = "bi bi-sun");
    } else {
      themeIcon.className = "bi bi-moon-stars";
      themeIconMobile && (themeIconMobile.className = "bi bi-moon-stars");
    }
  }

  function initTheme() {
    const saved = localStorage.getItem("qs_theme");
    if (saved) return applyTheme(saved);
    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  themeToggle &&
    themeToggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  themeToggleMobile &&
    themeToggleMobile.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
    });

  function openSidebar() {
    sidebar.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("sidebar-open");
    // prevent background scroll when menu open
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sidebar-open");
    document.body.style.overflow = "";
  }

  mobileMenuBtn &&
    mobileMenuBtn.addEventListener("click", () => {
      if (sidebar.classList.contains("open")) closeSidebar();
      else openSidebar();
    });

  // clicking overlay closes sidebar
  overlay && overlay.addEventListener("click", () => closeSidebar());

  function switchSection(name) {
    navBtns.forEach((b) =>
      b.classList.toggle("active", b.dataset.section === name)
    );
    Object.values(panels).forEach((p) => p.classList.remove("active"));
    panels[name].classList.add("active");
    // close sidebar on mobile when navigating
    if (window.innerWidth < 900) closeSidebar();
  }

  navBtns.forEach((b) =>
    b.addEventListener("click", () => switchSection(b.dataset.section))
  );

  function save() {
    localStorage.setItem("qs_bookings", JSON.stringify(bookings));
  }

  function updateStats() {
    statProviders.textContent = providers.length;
    statBookings.textContent = bookings.length;
  }

  function renderBookings() {
    bookingsList.innerHTML = "";
    if (!bookings.length) {
      bookingsList.textContent = "No bookings yet.";
      return;
    }
    bookings.forEach((bk, i) => {
      const el = document.createElement("div");
      el.className = "booking-item";
      el.innerHTML = `<div><strong>${bk.provider.name}</strong><div class="muted small">${bk.date} • ${bk.time}</div></div><div><button data-i='${i}' class='btn btn-ghost small' aria-label="Delete booking"><i class='bi bi-trash'></i></button></div>`;
      bookingsList.appendChild(el);
    });
    bookingsList.querySelectorAll("button[data-i]").forEach((b) =>
      b.addEventListener("click", () => {
        bookings.splice(Number(b.dataset.i), 1);
        save();
        renderBookings();
        updateStats();
        const dateVal = qs("#dateInput").value;
        if (providerSelect.value && dateVal) {
          renderRecentFor(providerSelect.value, dateVal);
        }
      })
    );
  }

  function renderRecentFor(providerId, dateStr) {
    const list = bookings.filter(
      (b) => String(b.provider.id) === String(providerId) && b.date === dateStr
    );
    recentList.innerHTML = "";
    if (!list.length) {
      recentList.textContent = "No bookings for this selection.";
      return;
    }
    list.forEach((bk, idx) => {
      const el = document.createElement("div");
      el.className = "booking-item";
      el.innerHTML = `<div><strong>${bk.time}</strong><div class='muted small'>${bk.provider.name}</div></div><div><button data-slot='${bk.slotId}' class='delete-btn' title='Delete booking' aria-label="Delete recent booking"><i class='bi bi-trash'></i></button></div>`;
      recentList.appendChild(el);
    });
    // attach delete handlers
    recentList.querySelectorAll("button.delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slotId = btn.dataset.slot;
        const i = bookings.findIndex((b) => b.slotId === slotId);
        if (i > -1) {
          bookings.splice(i, 1);
          save();
          renderBookings();
          updateStats();
          const dateVal = qs("#dateInput").value;
          if (providerSelect.value && dateVal) {
            renderRecentFor(providerSelect.value, dateVal);
          }
        }
      });
    });
  }

  async function fetchProviders() {
    providerSelect.disabled = true;
    providerSelect.innerHTML = "<option>Loading…</option>";
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      providers = await res.json();
      providerSelect.innerHTML = providers
        .map(
          (p) =>
            `<option value='${p.id}'>${p.name} — ${p.company.name}</option>`
        )
        .join("");
      providerSelect.disabled = false;
      updateStats();
    } catch (e) {
      providerSelect.innerHTML = "<option>Failed</option>";
    }
  }

  async function syncClock() {
    try {
      const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
      const j = await res.json();
      const utc = new Date(j.utc_datetime).toUTCString().replace("GMT", "UTC");
      statClock.textContent = utc;
      if (mobileClock) mobileClock.textContent = utc;
    } catch (e) {
      const utc = new Date().toUTCString().replace("GMT", "UTC");
      statClock.textContent = utc;
      if (mobileClock) mobileClock.textContent = utc;
    }
  }

  function makeSlots(providerId, dateStr) {
    // deterministic slots
    let s =
      (Number(providerId) * 9301 + Number(dateStr.replace(/-/g, "")) * 49297) %
      233280;
    const r = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const slots = [];
    for (let i = 8; i <= 16; i += 1) {
      ["00", "30"].forEach((m) => {
        const free = r() > 0.25;
        const time = `${String(i).padStart(2, "0")}:${m}`;
        slots.push({ time, free, id: `${providerId}-${dateStr}-${time}` });
      });
    }
    return slots;
  }

  function renderSlots(provider, dateStr) {
    const slots = makeSlots(provider.id, dateStr);
    slotsGrid.innerHTML = "";
    if (!slots.length) {
      slotsGrid.innerHTML = '<div class="empty">No slots</div>';
      return;
    }
    slots.forEach((s) => {
      const el = document.createElement("div");
      el.className = "slot" + (s.free ? "" : " unavailable");
      const booked = bookings.some((b) => b.slotId === s.id);
      el.innerHTML = `<div class='time'>${s.time}</div><div class='meta'>${
        s.free
          ? booked
            ? '<span class="muted">Booked</span>'
            : "Available"
          : "Unavailable"
      }</div>`;
      if (s.free && !booked) {
        el.addEventListener("click", () =>
          confirmSlot({ provider, date: dateStr, time: s.time, slotId: s.id })
        );
      }
      slotsGrid.appendChild(el);
    });
    slotsHeadline.textContent = `${provider.name} — ${new Date(
      dateStr
    ).toDateString()}`;
    // show recent bookings for this provider+date
    renderRecentFor(provider.id, dateStr);
  }

  function confirmSlot(sel) {
    const toast = qs("#confirmToast");
    qs("#confirmTitle").textContent = `${sel.provider.name} • ${sel.time}`;
    qs("#confirmMeta").textContent = `${new Date(sel.date).toDateString()}`;
    toast.classList.add("show");
    toast.setAttribute("aria-hidden", "false");

    const hide = () => {
      toast.classList.remove("show");
      toast.setAttribute("aria-hidden", "true");
    };
    const cancel = qs("#confirmCancel");
    const confirm = qs("#confirmBtn");
    const onCancel = () => {
      cancel.removeEventListener("click", onCancel);
      confirm.removeEventListener("click", onConfirm);
      hide();
    };
    const onConfirm = () => {
      bookings.push({
        provider: sel.provider,
        date: sel.date,
        time: sel.time,
        slotId: sel.slotId,
      });
      save();
      renderBookings();
      updateStats();
      renderRecentFor(sel.provider.id, sel.date);
      hide();
      cancel.removeEventListener("click", onCancel);
      confirm.removeEventListener("click", onConfirm);
    };
    cancel.addEventListener("click", onCancel);
    confirm.addEventListener("click", onConfirm);
  }

  loadSlotsBtn.addEventListener("click", () => {
    const pid = providerSelect.value;
    const dateVal = qs("#dateInput").value;
    if (!pid || !dateVal) {
      alert("Select provider + date");
      return;
    }
    const provider = providers.find((p) => String(p.id) === String(pid));
    renderSlots(provider, dateVal);
  });

  refreshBtn.addEventListener("click", () => {
    fetchProviders();
    syncClock();
  });
  clearBookingsBtn.addEventListener("click", () => {
    if (confirm("Clear bookings?")) {
      bookings = [];
      save();
      renderBookings();
      updateStats();
      const dateVal = qs("#dateInput").value;
      if (providerSelect.value && dateVal) {
        renderRecentFor(providerSelect.value, dateVal);
      }
    }
  });

  // init
  (async () => {
    initTheme();
    renderBookings();
    updateStats();
    await fetchProviders();
    await syncClock();
    setInterval(syncClock, 60000);
  })();

  return { switchSection };
})();

// expose for debugging
window.QS = UI;
