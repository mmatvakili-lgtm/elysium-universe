const BASE_URL = "https://rico6.pythonanywhere.com";

// ================= تنظیمات پیشرفته ستاره‌ها =================
particlesJS("particles-js", {
  particles: {
    number: { value: 60, density: { enable: true, value_area: 800 } },
    color: { value: ["#f1f0c8"] },
    shape: { type: "circle" },
    opacity: {
      value: 0.5,
      random: true,
      anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
    } /* 🔴 کم‌نورتر شد */,
    size: {
      value: 1.5,
      random: true,
      anim: { enable: true, speed: 2, size_min: 0.5, sync: false },
    } /* 🔴 بسیار ریز و ظریف شد */,
    line_linked: {
      enable: true,
      distance: 120,
      color: "#ffffff",
      opacity: 0.15,
      width: 1,
    } /* 🔴 خطوط نامحسوس‌تر شد */,
    move: {
      enable: true,
      speed: 0.8,
      direction: "none",
      random: true,
      out_mode: "out",
    },
  },
  interactivity: {
    detect_on: "window",
    events: {
      onhover: { enable: true, mode: "bubble" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
    modes: {
      bubble: { distance: 150, size: 3, duration: 2, opacity: 0.8 },
      push: { particles_nb: 2 },
    },
  },
  retina_detect: false,
});

// افکت تایپ
var typed = new Typed("#typed-text", {
  strings: ["به بهشت آرمانی ما خوش آمدی ❤️", "مقصدی برای آرامش... ✨"],
  typeSpeed: 60,
  backSpeed: 40,
  backDelay: 3000,
  loop: true,
  showCursor: false,
});

// ================= سیستم ورود (Authentication) =================
function attemptLogin() {
  const userVal = document.getElementById("username").value;
  const passVal = document.getElementById("password").value;
  const errorMsg = document.getElementById("login-error");

  if (!userVal || !passVal) {
    errorMsg.innerText = "فیلدها را کامل کنید.";
    return;
  }
  errorMsg.innerText = "در حال احراز هویت... ⏳";

  fetch(BASE_URL + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: userVal, password: passVal }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        localStorage.setItem("elysium_user", userVal);
        document.getElementById("profile-name").innerText =
          userVal === "matin" ? "متین عزیز" : "مطهره جان";
        document
          .getElementById("login-page")
          .classList.replace("active-view", "hidden-view");
        document
          .getElementById("main-dashboard")
          .classList.replace("hidden-view", "active-view");

        if (data.role === "admin") {
          document.getElementById("admin-menu").classList.remove("hidden-view");
          // 🔴 روشن کردن رادار ادمین بلافاصله پس از لاگین دستی
          if (typeof startAdminRadar === "function") startAdminRadar();
        }
        loadLetters();
        checkNightOwlMode();
        startSoulSyncPing();
        checkSkyMirrorWeather();
        initConstellationMinigame(); // اجرای مینی‌گیم مخفی
      } else {
        errorMsg.innerText = data.message;
      }
    })
    .catch(() => (errorMsg.innerText = "❌ خطا در اتصال به سرور"));
}

// ================= ورود خودکار و هوشمند (Auto-Login) =================
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("elysium_user");
  if (user) {
    document.getElementById("profile-name").innerText =
      user === "matin" ? "متین عزیز" : "مطهره جان";
    document
      .getElementById("login-page")
      .classList.replace("active-view", "hidden-view");
    document
      .getElementById("main-dashboard")
      .classList.replace("hidden-view", "active-view");

    if (user === "matin") {
      document.getElementById("admin-menu").classList.remove("hidden-view");
      // 🔴 روشن کردن رادار در ورود خودکار
      if (typeof startAdminRadar === "function") startAdminRadar();
    }
    loadLetters();
    checkNightOwlMode();
    startSoulSyncPing();
    checkSkyMirrorWeather();
    initConstellationMinigame(); // اجرای مینی‌گیم مخفی
  }
});

function logout() {
  localStorage.removeItem("elysium_user");
  document
    .getElementById("main-dashboard")
    .classList.replace("active-view", "hidden-view");
  document
    .getElementById("login-page")
    .classList.replace("hidden-view", "active-view");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("admin-menu").classList.add("hidden-view");
  closeMenu();
}

// ================= Drawer Menu & Routing =================
function openMenu() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("menu-backdrop").classList.add("active");
}

function closeMenu() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menu-backdrop").classList.remove("active");
}

// ================= مسیریابی و داشبورد (SPA Routing) =================
function showSection(sectionId, element) {
  // 🔴 مدیریت هوشمند دکمه بازگشت (اگر صفحه اصلی نباشد، دکمه بازگشت ظاهر می‌شود)
  const backBtn = document.getElementById("global-back-btn");
  if (backBtn) {
    if (sectionId === "home")
      backBtn.classList.replace("active-view", "hidden-view");
    else backBtn.classList.replace("hidden-view", "active-view");
  }

  // ۱. آپدیت استایل دکمه‌های منو
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  if (element) element.classList.add("active");

  // ۲. پنهان کردن تمام صفحات
  document.querySelectorAll(".app-section").forEach((sec) => {
    sec.classList.remove("active-section");
    sec.classList.add("hidden-section");
  });

  // ۳. نمایش صفحه هدف با انیمیشن
  const target = document.getElementById("section-" + sectionId);
  target.classList.remove("hidden-section");
  setTimeout(() => target.classList.add("active-section"), 50);

  // ۴. تغییر عنوان بالای صفحه
  const titles = {
    home: "صفحه اصلی",
    letters: "صندوقچه نامه‌ها",
    profile: "تنظیمات پروفایل",
    "admin-panel": "پنل مدیریت مرکزی",
    studio: "استودیو نویسندگی",
    gallery: "گالری کهکشانی",
    timecenter: "مرکز زمان ⏳",
    vault: "گاوصندوق رازها 🔐",
    echo: "پژواک کهکشان 📡",
    shrine: "موزه یادگاری‌های مقدس 🏛️", // 🔴 اضافه شد
  };
  document.getElementById("page-title").innerText = titles[sectionId] || "";

  // ۵. لود کردن دیتای مخصوص هر بخش
  if (sectionId === "letters") loadLetters();
  if (sectionId === "gallery") loadGallery();
  if (sectionId === "timecenter") loadTimeCenter();
  if (sectionId === "vault") loadVaultQuestion();
  if (sectionId === "home") loadMemoryLane();
  if (sectionId === "echo")
    document.getElementById("echo-text-input").value = "";

  // ۶. بستن منو (حذف شرط سایز صفحه تا همیشه بسته شود)
  closeMenu();
}

// ================= تنظیمات پروفایل (تغییر رمز) =================
function resetPasswordForm() {
  document.getElementById("old-pass").value = "";
  document.getElementById("new-pass").value = "";
  document.getElementById("password-msg").innerText = "";
}

function changePassword() {
  const user = localStorage.getItem("elysium_user");
  const oldPass = document.getElementById("old-pass").value;
  const newPass = document.getElementById("new-pass").value;
  const msgBox = document.getElementById("password-msg");

  if (!oldPass || !newPass) {
    msgBox.style.color = "#ff4d4d";
    msgBox.innerText = "هر دو فیلد را پر کنید.";
    return;
  }
  msgBox.style.color = "#94a3b8";
  msgBox.innerText = "در حال پردازش... ⏳";

  fetch(BASE_URL + "/api/change_password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user,
      old_password: oldPass,
      new_password: newPass,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        msgBox.style.color = "#10b981";
        msgBox.innerText = data.message;
        setTimeout(resetPasswordForm, 3000);
      } else {
        msgBox.style.color = "#ff4d4d";
        msgBox.innerText = data.message;
      }
    })
    .catch((err) => {
      msgBox.style.color = "#ff4d4d";
      msgBox.innerText = "❌ خطا در ارتباط با سرور";
    });
}

// ================= Modals =================
function openModal(title, bodyHtml) {
  document.getElementById("detail-title").innerText = title;
  document.getElementById("detail-body").innerHTML = bodyHtml;
  document
    .getElementById("overlay-backdrop")
    .classList.replace("hidden-view", "active-view");
  document
    .getElementById("modal-container")
    .classList.replace("hidden-view", "active-view");
}

function closeDetail() {
  document
    .getElementById("overlay-backdrop")
    .classList.replace("active-view", "hidden-view");
  document
    .getElementById("modal-container")
    .classList.replace("active-view", "hidden-view");
  document
    .querySelectorAll("#detail-body video")
    .forEach((media) => media.pause());

  // 🔴 دستور خفه‌کنِ قطعی: با بستن هر مودالی، صداهای جادویی قطع می‌شوند
  if (window.magicAudio) {
    window.magicAudio.pause();
    window.magicAudio.currentTime = 0;
  }
  if (window.shrineAudio) {
    window.shrineAudio.pause();
    window.shrineAudio.currentTime = 0;
  }
}
// ================= نگهبان امنیتی (جلوگیری از دسترسی قبل از لاگین) =================
function checkAuthGuard() {
  if (!localStorage.getItem("elysium_user")) {
    console.warn("دسترسی غیرمجاز مسدود شد.");
    return false;
  }
  return true;
}

// API Calls (با حفاظت امنیتی)
// ================= ارتقای گرافیکی: شیشه دلایل (Daily Reasons) =================
function showTodaysReason() {
  if (!checkAuthGuard()) return;

  // مرحله اول: نمایش شیشه جادویی
  const jarHtml = `
    <div class="jar-container" onclick="openMagicJar()">
        <div class="magic-jar"><i class="fa-solid fa-jar"></i></div>
        <h3 style="color: var(--orange-main); margin-top: 35px; font-size: 1.4rem;">شیشه دلایل امروز پر می‌درخشد...</h3>
        <p style="color: var(--text-muted); margin-top: 10px; font-size: 1.05rem;">برای باز کردنش کلیک کن</p>
    </div>
  `;
  openModal("دلیل امروز ما ❤️", jarHtml);
}

// ================= ارتقای گرافیکی: شیشه دلایل (Daily Reasons) =================
function openMagicJar() {
  const container = document.getElementById("detail-body");
  // انیمیشن لودینگ حین باز شدن شیشه
  container.innerHTML = `<div style="text-align:center; padding: 60px;"><i class="fa-solid fa-sun fa-spin text-orange" style="font-size: 4rem;"></i><p style="margin-top:25px; color:var(--text-muted); font-size: 1.1rem;">در حال گشودن رازِ امروز...</p></div>`;

  fetch(BASE_URL + "/api/todays_reason")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        // پخش صدای باز شدن جادو (متصل به حافظه window برای کنترل در زمان بسته شدن)
        try {
          if (window.magicAudio) window.magicAudio.pause();
          window.magicAudio = new Audio(BASE_URL + "/magic.mp3");
          window.magicAudio.play().catch((e) => {});
        } catch (e) {}

        // ساختار کارت فضایی جدید
        container.innerHTML = `
            <div class="magic-reason-card">
                <div style="position: relative; z-index: 2;">
                    ${data.data}
                    <div style="margin-top:35px; font-size: 2.8rem; filter: drop-shadow(0 0 15px rgba(249, 123, 34, 0.8)); animation: pulseJarMagic 2s infinite alternate;">❤️</div>
                </div>
            </div>
          `;

        // افکت انفجار قلب‌ها، ستاره‌ها و درخشش در پس‌زمینه کارت
        for (let i = 0; i < 25; i++) {
          setTimeout(() => {
            const particle = document.createElement("i");
            const icons = ["fa-heart", "fa-star", "fa-sparkles"];
            const colors = ["#ff4d4d", "#ffd700", "#f97b22"];
            particle.className =
              "fa-solid " + icons[Math.floor(Math.random() * icons.length)];
            particle.style.position = "absolute";
            particle.style.color =
              colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 80 + 10 + "%";
            particle.style.top = Math.random() * 80 + 10 + "%";
            particle.style.zIndex = "320";
            particle.style.pointerEvents = "none";
            particle.style.filter = `drop-shadow(0 0 10px ${particle.style.color})`;
            container.appendChild(particle);

            // انیمیشن سه‌مرحله‌ای (ظاهر شدن، بالا رفتن، محو شدن)
            particle.animate(
              [
                { transform: "translateY(0) scale(0)", opacity: 0 },
                {
                  transform: "translateY(-20px) scale(1.5)",
                  opacity: 1,
                  offset: 0.5,
                },
                {
                  transform: `translateY(-80px) scale(0.8) rotate(${Math.random() * 90 - 45}deg)`,
                  opacity: 0,
                },
              ],
              {
                duration: 2000 + Math.random() * 1000,
                fill: "forwards",
                easing: "cubic-bezier(0.25, 1, 0.5, 1)",
              },
            );
            setTimeout(() => particle.remove(), 3000);
          }, i * 100); // تاخیر ملایم برای ایجاد افکت بارشی
        }
      } else {
        container.innerHTML = `<p style='color:#ff4d4d; text-align:center; font-size:1.1rem;'>${data.message}</p>`;
      }
    })
    .catch(
      (e) =>
        (container.innerHTML =
          "<p style='color:#ff4d4d; text-align:center;'>❌ خطا در ارتباط</p>"),
    );
}

// ================= فاز نهایی: موتور هوشمند مرکز زمان (Time Center) =================

// مبدل اختصاصی شمسی به میلادی برای محاسبات دقیق ریاضی
function jalaliToGregorian(jy, jm, jd) {
  jy = parseInt(jy);
  jm = parseInt(jm);
  jd = parseInt(jd);
  let j_day_no =
    365 * (jy - 979) +
    parseInt((jy - 979) / 33) * 8 +
    parseInt((((jy - 979) % 33) + 3) / 4);
  for (let i = 0; i < jm - 1; ++i) j_day_no += i < 6 ? 31 : 30;
  j_day_no += jd - 1;
  let g_day_no = j_day_no + 79;
  let gy = 1600 + parseInt(g_day_no / 146097) * 400;
  g_day_no = g_day_no % 146097;
  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += parseInt(g_day_no / 36524) * 100;
    g_day_no = g_day_no % 36524;
    if (g_day_no >= 365) g_day_no++;
    else leap = false;
  }
  gy += parseInt(g_day_no / 1461) * 4;
  g_day_no %= 1461;
  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += parseInt(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }
  let i,
    g_days_in_month = [
      31,
      leap ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
  for (i = 0; g_day_no >= g_days_in_month[i]; i++)
    g_day_no -= g_days_in_month[i];
  return new Date(gy, i, g_day_no + 1);
}

// گرفتن تاریخ شمسی امروز
function getCurrentJalali() {
  const d = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date());
  const p = d.split("/"); // M/D/YYYY
  return { jy: parseInt(p[2]), jm: parseInt(p[0]), jd: parseInt(p[1]) };
}

let liveTimeCenterInterval = null;

function loadTimeCenter() {
  fetch(BASE_URL + "/api/admin/events")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success" && data.data) {
        processTimeCenterData(data.data);
        // رفرش زنده‌ی زمان هر یک دقیقه
        if (liveTimeCenterInterval) clearInterval(liveTimeCenterInterval);
        liveTimeCenterInterval = setInterval(
          () => processTimeCenterData(data.data),
          60000,
        );
      }
    });
}

function processTimeCenterData(events) {
  let oneTimeEvents = [];
  let annualEvents = [];
  const today = getCurrentJalali();

  events.forEach((evt) => {
    const parts = evt.date.split("/");
    if (parts.length === 3) {
      // یک‌بار مصرف (دارای سال)
      const gDate = jalaliToGregorian(parts[0], parts[1], parts[2]);
      oneTimeEvents.push({ ...evt, gDate: gDate, parts: parts });
    } else if (parts.length === 2) {
      // سالانه (بدون سال) - فرمت: MM/DD
      annualEvents.push({
        ...evt,
        jm: parseInt(parts[0]),
        jd: parseInt(parts[1]),
      });
    }
  });

  // سورت کردن تایم‌لاین (از قدیمی به جدید)
  oneTimeEvents.sort((a, b) => a.gDate - b.gDate);
  renderTimeline(oneTimeEvents);
  renderElapsedCounters(oneTimeEvents);
  renderAnnualCounters(annualEvents, today);
}

function renderTimeline(events) {
  const container = document.getElementById("tc-timeline-container");
  if (events.length === 0) {
    container.innerHTML =
      "<p class='text-muted text-center'>مختصاتی ثبت نشده است.</p>";
    return;
  }

  let html = "";
  events.forEach((evt, index) => {
    const side = index % 2 === 0 ? "right" : "left";
    html += `
            <div class="timeline-item ${side}">
                <div class="timeline-content">
                    <div class="timeline-date"><i class="fa-solid fa-star text-orange"></i> ${evt.date}</div>
                    <div class="timeline-title">${evt.title}</div>
                </div>
            </div>`;
  });
  container.innerHTML = html;
}

function renderElapsedCounters(events) {
  const container = document.getElementById("tc-elapsed-container");
  const now = new Date();
  let html = "";

  events.forEach((evt) => {
    let diffMs = now - evt.gDate;
    if (diffMs < 0) diffMs = 0;

    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);

    let y = Math.floor(days / 365);
    let remD = days % 365;
    let m = Math.floor(remD / 30);
    remD = remD % 30;
    let w = Math.floor(remD / 7);
    let d = remD % 7;

    let res = [];
    if (y > 0) res.push(`${y} سال`);
    if (m > 0) res.push(`${m} ماه`);
    if (w > 0) res.push(`${w} هفته`);
    if (d > 0) res.push(`${d} روز`);
    res.push(`${hours} ساعت`);
    res.push(`${minutes} دقیقه`);

    html += `
            <div class="tc-card elapsed">
                <div class="tc-card-title"><i class="fa-solid fa-check-double text-orange"></i> ${evt.title}</div>
                <div class="tc-card-time">${res.join(" و ")} گذشت</div>
            </div>`;
  });
  container.innerHTML = html || "<p class='text-muted'>داده‌ای وجود ندارد.</p>";
}

function renderAnnualCounters(events, today) {
  const container = document.getElementById("tc-annual-container");
  const now = new Date();
  let html = "";

  events.forEach((evt) => {
    let nextYear = today.jy;
    // اگر ماه گذشته است، یا در همان ماهیم اما روز گذشته است، پرش به سال بعد
    if (today.jm > evt.jm || (today.jm === evt.jm && today.jd > evt.jd)) {
      nextYear++;
    }

    const nextGDate = jalaliToGregorian(nextYear, evt.jm, evt.jd);
    let diffMs = nextGDate - now;
    const diffDays = Math.ceil(diffMs / 86400000);

    const text =
      diffDays === 0
        ? "<span style='color:var(--orange-main);'>🎉 امروز!</span>"
        : `${diffDays} روز مانده`;

    html += `
            <div class="tc-card annual">
                <div class="tc-card-title"><i class="fa-solid fa-hourglass-half text-green"></i> ${evt.title}</div>
                <div class="tc-card-time">${text}</div>
            </div>`;
  });
  container.innerHTML = html || "<p class='text-muted'>داده‌ای وجود ندارد.</p>";
}

function showRandomMemory() {
  if (!checkAuthGuard()) return;
  openModal("خاطرات ما 📸", "<p>در حال باز کردن صندوقچه... ⏳</p>");
  fetch(BASE_URL + "/api/random_memory")
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("detail-body").innerHTML =
        data.status === "success" ? data.data : `<p>${data.message}</p>`;
    })
    .catch(
      (e) =>
        (document.getElementById("detail-body").innerHTML =
          "<p>❌ خطا در ارتباط</p>"),
    );
}

// ================= موتور سراسری پردازش موسیقی (Global Audio Engine) =================
const globalAudio = new Audio();
let globalPlaylist = [];
let currentSongIndex = -1;
// استخراج لیست آهنگ‌های پسندیده شده از حافظه مرورگر
let likedSongs = JSON.parse(
  localStorage.getItem("elysium_liked_songs") || "[]",
);

globalAudio.addEventListener("timeupdate", updateGlobalProgress);
globalAudio.addEventListener("ended", nextGlobalSong);

// لود کردن کل لیست آهنگ‌ها در بک‌گراند
function loadGlobalPlaylist(callback) {
  if (globalPlaylist.length > 0) {
    if (callback) callback();
    return;
  }
  fetch(BASE_URL + "/api/all_songs")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        globalPlaylist = data.data;
        if (callback) callback();
      }
    });
}

function playGlobalSong(index) {
  if (index < 0 || index >= globalPlaylist.length) return;
  currentSongIndex = index;
  const song = globalPlaylist[currentSongIndex];

  globalAudio.src = `${BASE_URL}/api/play_song/${song.file_id}`;
  globalAudio.play();

  document.getElementById("mini-player-title").innerText = song.title;
  document.getElementById("global-play-icon").className = "fa-solid fa-pause";
  document.getElementById("global-mini-player").classList.add("active-player");
  document
    .getElementById("global-mini-player")
    .classList.remove("hidden-player");

  // 🔴 اضافه کردن کلاس به body تا پایین تمام صفحات (مثل استودیو) برای پلیر جا باز شود
  document.body.classList.add("has-active-player");

  updateGlobalLikeButton();
  renderPlaylistUI();
}

function toggleGlobalPlay() {
  if (!globalAudio.src || currentSongIndex === -1) return;
  const icon = document.getElementById("global-play-icon");
  if (globalAudio.paused) {
    globalAudio.play();
    icon.className = "fa-solid fa-pause";
  } else {
    globalAudio.pause();
    icon.className = "fa-solid fa-play";
  }
  renderPlaylistUI();
}

function nextGlobalSong() {
  if (globalPlaylist.length === 0) return;
  let nextIndex = currentSongIndex + 1;
  if (nextIndex >= globalPlaylist.length) nextIndex = 0; // برگشت به اول لیست
  playGlobalSong(nextIndex);
}

function prevGlobalSong() {
  if (globalPlaylist.length === 0) return;
  let prevIndex = currentSongIndex - 1;
  if (prevIndex < 0) prevIndex = globalPlaylist.length - 1; // رفتن به آخر لیست
  playGlobalSong(prevIndex);
}

function toggleGlobalLike() {
  if (currentSongIndex === -1) return;
  const songId = globalPlaylist[currentSongIndex].id;
  const indexInLikes = likedSongs.indexOf(songId);

  if (indexInLikes === -1) likedSongs.push(songId);
  else likedSongs.splice(indexInLikes, 1);

  localStorage.setItem("elysium_liked_songs", JSON.stringify(likedSongs)); // ذخیره ابدی در دستگاه
  updateGlobalLikeButton();
  renderPlaylistUI();
}

function updateGlobalLikeButton() {
  if (currentSongIndex === -1) return;
  const songId = globalPlaylist[currentSongIndex].id;
  const likeBtn = document.getElementById("like-btn");
  const icon = likeBtn.querySelector("i");

  if (likedSongs.includes(songId)) {
    likeBtn.classList.add("liked");
    icon.className = "fa-solid fa-heart";
  } else {
    likeBtn.classList.remove("liked");
    icon.className = "fa-regular fa-heart";
  }
}

function updateGlobalProgress() {
  if (!globalAudio.duration) return;
  const percent = (globalAudio.currentTime / globalAudio.duration) * 100;
  document.getElementById("global-progress-bar").style.width = percent + "%";

  let cMins = Math.floor(globalAudio.currentTime / 60);
  let cSecs = Math.floor(globalAudio.currentTime % 60)
    .toString()
    .padStart(2, "0");
  let dMins = Math.floor(globalAudio.duration / 60);
  let dSecs = Math.floor(globalAudio.duration % 60)
    .toString()
    .padStart(2, "0");
  document.getElementById("global-time-display").innerText =
    `${cMins}:${cSecs} / ${dMins}:${dSecs}`;
}

function seekGlobalAudio(e) {
  if (!globalAudio.duration) return;
  const container = document.getElementById("global-progress-container");
  const rect = container.getBoundingClientRect();
  let percent = (e.clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  globalAudio.currentTime = percent * globalAudio.duration;
}

// 🔴 تابع جدید برای بستن کامل موزیک پلیر
function closeGlobalPlayer() {
  globalAudio.pause();
  globalAudio.currentTime = 0;
  currentSongIndex = -1;
  document
    .getElementById("global-mini-player")
    .classList.remove("active-player");
  document.getElementById("global-mini-player").classList.add("hidden-player");
  // حذف فضای اضافی از پایین صفحه
  document.body.classList.remove("has-active-player");
}

// ================= رابط کاربری پلی‌لیست درون مودال =================
function showRandomSong() {
  if (!checkAuthGuard()) return;
  loadGlobalPlaylist(() => {
    if (globalPlaylist.length === 0) return alert("هیچ آهنگی وجود ندارد!");
    const randIndex = Math.floor(Math.random() * globalPlaylist.length);
    playGlobalSong(randIndex);
    showSongsLibrary(); // لیست را هم باز کن تا بداند چه آهنگی پلی شده
  });
}

function showSongsLibrary() {
  if (!checkAuthGuard()) return;
  openModal("پلی‌لیست ما 🎵", "<p>در حال بارگذاری آرشیو موسیقی... ⏳</p>");
  loadGlobalPlaylist(() => renderPlaylistUI());
}

function renderPlaylistUI() {
  const container = document.getElementById("detail-body");
  if (
    !container ||
    document.getElementById("detail-title").innerText !== "پلی‌لیست ما 🎵"
  )
    return;

  let html = `<button class="btn-outline" style="margin-bottom: 25px; border-color: var(--orange-main); color: var(--orange-main); font-size:1.05rem;" onclick="showRandomSong()"><i class="fa-solid fa-shuffle"></i> پخش تصادفی یک آهنگ</button>`;

  if (globalPlaylist.length === 0) {
    html += `<p class="text-muted">هنوز هیچ آهنگی در دیتابیس ثبت نشده است.</p>`;
  } else {
    html += `<div style="display:flex; flex-direction:column; max-height: 50vh; overflow-y: auto; padding-right: 5px;">`;

    globalPlaylist.forEach((song, index) => {
      const isPlaying = index === currentSongIndex;
      const isPaused = globalAudio.paused;
      const activeClass = isPlaying ? "playing" : "";
      const playIcon = isPlaying && !isPaused ? "fa-pause" : "fa-play";

      const isLiked = likedSongs.includes(song.id);
      const heartClass = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
      const heartColor = isLiked ? "#ff4d4d" : "var(--text-muted)";

      html += `
            <div class="playlist-item ${activeClass}" onclick="playSongFromList(${index})">
                <div style="display:flex; align-items:center; gap:15px;">
                    <button class="play-btn" style="width:35px; height:35px; font-size:0.9rem;" onclick="event.stopPropagation(); playSongFromList(${index})">
                        <i class="fa-solid ${playIcon}"></i>
                    </button>
                    <h4 style="color: var(--text-main); margin:0; font-size: 1rem;"><i class="fa-solid fa-music text-green"></i> ${song.title}</h4>
                </div>
                <div><i class="${heartClass}" style="color:${heartColor}; font-size:1.2rem;"></i></div>
            </div>`;
    });
    html += `</div>`;
  }
  container.innerHTML = html;
}

function playSongFromList(index) {
  if (index === currentSongIndex) toggleGlobalPlay();
  else playGlobalSong(index);
}

let currentlyPlayingAudio = null;
let wasGlobalPlaying = false; // 🔴 حافظه هوشمند برای بازگرداندن آهنگ پس‌زمینه

// ================= توابع ضروری پخش و نوار پیشرفت =================
function updateProgress(id) {
  const audio = document.getElementById("audio-" + id);
  const progressBar = document.getElementById("progress-" + id);
  const timeDisplay = document.getElementById("time-" + id);

  if (!audio) return;

  let duration = audio.duration;
  let currentTime = audio.currentTime;

  // 🔴 مدیریت هوشمند خطای Infinity در فایل‌های WebM مرورگر
  if (!isFinite(duration)) {
    if (progressBar) progressBar.style.width = "100%";
    if (timeDisplay) {
      let cMins = Math.floor(currentTime / 60);
      let cSecs = Math.floor(currentTime % 60)
        .toString()
        .padStart(2, "0");
      timeDisplay.innerText = `${cMins}:${cSecs} / 🎙️ زنده`;
    }
    return;
  }

  const percent = (currentTime / duration) * 100;
  if (progressBar) progressBar.style.width = percent + "%";

  if (timeDisplay) {
    let cMins = Math.floor(currentTime / 60);
    let cSecs = Math.floor(currentTime % 60)
      .toString()
      .padStart(2, "0");
    let dMins = Math.floor(duration / 60);
    let dSecs = Math.floor(duration % 60)
      .toString()
      .padStart(2, "0");
    timeDisplay.innerText = `${cMins}:${cSecs} / ${dMins}:${dSecs}`;
  }
}

function seekAudio(e, id) {
  const audio = document.getElementById("audio-" + id);
  const container = document.getElementById("progress-container-" + id);
  if (!audio || !audio.duration || !isFinite(audio.duration)) return;

  const rect = container.getBoundingClientRect();
  let percent = (e.clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  audio.currentTime = percent * audio.duration;
}

function togglePlay(id) {
  const audio = document.getElementById("audio-" + id);
  const playIcon = document.getElementById("play-icon-" + id);

  if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
    currentlyPlayingAudio.pause();
    const oldId = currentlyPlayingAudio.id.split("-")[1];
    const oldIcon = document.getElementById("play-icon-" + oldId);
    if (oldIcon) oldIcon.className = "fa-solid fa-play";
  }

  if (audio.paused) {
    // 🔴 اگر موزیک گلوبال در حال پخش است، موقتاً متوقفش کن!
    if (typeof globalAudio !== "undefined" && !globalAudio.paused) {
      wasGlobalPlaying = true;
      globalAudio.pause();
      const globalIcon = document.getElementById("global-play-icon");
      if (globalIcon) globalIcon.className = "fa-solid fa-play";
    }

    audio.play();
    playIcon.className = "fa-solid fa-pause";
    currentlyPlayingAudio = audio;
  } else {
    audio.pause();
    playIcon.className = "fa-solid fa-play";
    currentlyPlayingAudio = null;
  }
}

// 🔴 بازگشت آهنگ پس‌زمینه بعد از اتمام وویس
function audioEnded(id) {
  const playIcon = document.getElementById("play-icon-" + id);
  if (playIcon) playIcon.className = "fa-solid fa-play";
  currentlyPlayingAudio = null;

  if (wasGlobalPlaying && typeof globalAudio !== "undefined") {
    globalAudio.play();
    const globalIcon = document.getElementById("global-play-icon");
    if (globalIcon) globalIcon.className = "fa-solid fa-pause";
    wasGlobalPlaying = false;
  }
}

// ================= دریافت لیست نامه‌ها (ارتقایافته با منطق کپسول زمان) =================
function loadLetters() {
  const container = document.getElementById("letters-container");
  if (!container) return;

  const currentUser = localStorage.getItem("elysium_user");
  const userRole = currentUser === "matin" ? "admin" : "partner";

  container.innerHTML =
    "<p style='color: var(--text-muted);'>در حال باز کردن صندوقچه نامه‌ها... ⏳</p>";

  fetch(BASE_URL + "/api/letters")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (data.data.length === 0) {
          container.innerHTML = `<div class="glass-panel text-center empty-state" style="grid-column: 1 / -1;"><i class="fa-solid fa-feather-pointed text-orange"></i><h3 style="margin-top: 15px;">هنوز نامه‌ای ثبت نشده</h3></div>`;
          return;
        }
        container.innerHTML = "";

        // 🔴 ساخت دکمه نوشتن نامه فقط برای پارتنر
        if (userRole === "partner") {
          const partnerBtnHtml = `
                <div style="text-align: center; margin-bottom: 25px; grid-column: 1 / -1;">
                    <button class="reverse-capsule-btn" style="width: 100%; font-size: 1.1rem; border-color: var(--orange-main); color: var(--orange-main);" onclick="openPartnerStudio()">
                        <i class="fa-solid fa-feather-pointed"></i> نوشتن نامه به آینده (برای متین)...
                    </button>
                </div>
            `;
          container.innerHTML += partnerBtnHtml;
        }
        data.data.forEach((letter) => {
          let isLocked = false;
          let lockMessage = "";
          let unlockTimeStr = "";

          // بررسی قفل بودن کپسول زمان
          if (letter.unlock_date && letter.unlock_date.trim() !== "") {
            const unlockTime = new Date(letter.unlock_date).getTime();
            const currentTime = new Date().getTime();

            if (currentTime < unlockTime) {
              isLocked = true;
              const dateObj = new Date(letter.unlock_date);
              unlockTimeStr =
                dateObj.toLocaleDateString("fa-IR") +
                " ساعت " +
                dateObj.toLocaleTimeString("fa-IR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              lockMessage = `این کپسول زمان تا ${unlockTimeStr} مهر و موم شده است... 🔒`;
            }
          }

          let statusHtml = "";
          let cardClass = "letter-card";
          let previewText = letter.preview;
          let clickAction = `onclick="openLetter(${letter.id})"`;
          let editedBadge = letter.edited_at
            ? `<span class="edited-badge"><i class="fa-solid fa-pen"></i> ویرایش شده: ${letter.edited_at}</span>`
            : "";

          if (isLocked) {
            cardClass += " letter-locked";
            statusHtml = `<span class="locked-badge"><i class="fa-solid fa-lock"></i> کپسول زمان</span>`;

            if (userRole === "admin") {
              // ظاهر برای ادمین: پیش‌نمایش واضح، اطلاع‌رسانی قفل
              previewText = `<span style="color:var(--text-main);">${letter.preview}</span><br><span style="color:#ff4d4d; font-size:0.85rem; font-weight:bold; margin-top:5px; display:inline-block;"><i class="fa-solid fa-hourglass-half fa-spin"></i> قفل برای پارتنر تا: ${unlockTimeStr}</span>`;
              statusHtml += ` <span style="font-size:0.7rem; color:var(--green-main);">(دسترسی تو باز است)</span>`;
              clickAction = `onclick="openLetter(${letter.id})"`;
            } else {
              // ظاهر برای پارتنر: بلور شدن متن و عدم دسترسی
              previewText = `<span class="blurred-text">${letter.preview}</span><span style="color:var(--orange-main); font-size:0.9rem; font-weight:bold;"><i class="fa-solid fa-hourglass-half fa-spin"></i> باز شدن در: ${unlockTimeStr}</span>`;
              clickAction = `onclick="handleLockedLetter(this, '${lockMessage}')"`;
            }
          } else {
            const readTimeStr = letter.read_at
              ? `<br><span style="font-size: 0.7rem; opacity: 0.7;">${letter.read_at}</span>`
              : "";
            statusHtml = letter.is_read
              ? `<span style="font-size:0.75rem; color:var(--green-main); border:1px solid var(--border-light); padding:4px 10px; border-radius:12px;">خوانده شده <i class="fa-solid fa-envelope-open"></i>${readTimeStr}</span>`
              : `<span style="font-size:0.75rem; color:#F97B22; border:1px solid rgba(249,123,34,0.3); padding:4px 10px; border-radius:12px;">جدید <i class="fa-solid fa-envelope"></i></span>`;
          }

          container.innerHTML += `
                          <div class="${cardClass}" ${clickAction}>
                              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                  <h3 class="letter-title">${isLocked ? '<i class="fa-solid fa-lock"></i> ' : ""}${letter.title}</h3>
                                  ${editedBadge}
                              </div>
                              <p class="letter-preview" style="margin-top: 10px;">${previewText}</p>
                              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                                  <span class="letter-date"><i class="fa-regular fa-calendar"></i> ${letter.date}</span>
                                  ${statusHtml}
                              </div>
                          </div>
                      `;
        });
      }
    });
}

// ================= تابع حذف نامه =================
function deleteLetter(id, event) {
  event.stopPropagation(); // جلوگیری از باز شدن مودال هنگام کلیک روی دکمه حذف
  if (confirm("آیا از حذف این نامه برای همیشه مطمئن هستی؟")) {
    fetch(BASE_URL + "/api/delete_letter/" + id, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          loadLetters();
        } else {
          alert(data.message);
        }
      })
      .catch((e) => alert("خطا در ارتباط با سرور"));
  }
}

// ================= موتور سینماتیک و تعاملی خواندن نامه‌ها =================
let currentLetterTitleForReact = "";

function openLetter(id) {
  const reader = document.getElementById("cinematic-reader");
  reader.classList.replace("hidden-view", "active-view");

  const ambient = document.getElementById("ambient-sound");
  if (ambient) {
    ambient.volume = 0.25;
    ambient.play().catch((e) => console.log("Autoplay blocked by browser."));
  }

  document.querySelectorAll(".btn-romantic-action").forEach((btn) => {
    btn.style.pointerEvents = "auto";
    btn.style.color = "#FEE8B0";
    btn.style.transform = "scale(1)";
  });

  document.getElementById("book-title").innerText =
    "در حال باز کردن مهر و موم...";
  document.getElementById("book-author").innerText = "";
  document.getElementById("book-page-text").innerHTML =
    "<i class='fa-solid fa-spinner fa-spin text-green' style='font-size: 2rem;'></i>";
  document.querySelector(".book-footer").style.visibility = "hidden";

  const currentUser = localStorage.getItem("elysium_user");
  const userRole = currentUser === "matin" ? "admin" : "partner";

  document.getElementById("partner-actions").style.display =
    userRole === "admin" ? "none" : "flex";

  fetch(BASE_URL + "/api/letter/" + id + "?role=" + userRole)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        const l = data.data;
        currentLetterTitleForReact = l.title;

        document.getElementById("book-title").innerText = l.title;
        document.getElementById("book-author").innerText =
          `${l.author} | ${l.date} ${l.edited_at ? `(ویرایش شده)` : ""}`;

        let rawText = l.content.replace(/<br>/g, "\n");
        currentBookPages = paginateText(rawText, 350);
        currentPageIndex = 0;

        document.querySelector(".book-footer").style.visibility = "visible";
        renderBookPage();

        if (userRole !== "admin") setTimeout(loadLetters, 1000);
      } else {
        document.getElementById("book-title").innerText = "دسترسی مسدود شد 🔒";
        document.getElementById("book-page-text").innerHTML = `
            <div style="text-align:center; margin-top:20px;">
                <i class="fa-solid fa-lock" style="font-size:3rem; color:var(--orange-main); margin-bottom:15px;"></i><br>
                <span style='color:var(--text-main); font-size:1.2rem;'>${data.message}</span>
            </div>`;
      }
    })
    .catch((err) => {
      document.getElementById("book-title").innerText = "خطا";
      document.getElementById("book-page-text").innerHTML =
        "<span class='text-orange'>❌ خطا در ارتباط با شبکه</span>";
    });
}

function closeCinematicReader() {
  document
    .getElementById("cinematic-reader")
    .classList.replace("active-view", "hidden-view");
  // توقف اتمسفر صوتی
  const ambient = document.getElementById("ambient-sound");
  ambient.pause();
  ambient.currentTime = 0;
}

// موتور پردازش واکنش‌های چندگانه
function sendReaction(type, btnElement) {
  // غیرفعال کردن تمام دکمه‌ها پس از یک انتخاب
  document.querySelectorAll(".btn-romantic-action").forEach((b) => {
    b.style.pointerEvents = "none";
    b.style.opacity = "0.5";
  });

  btnElement.style.opacity = "1";
  btnElement.style.color = "#F97B22"; // نارنجی پالت
  btnElement.style.transform = "scale(1.2)";

  const icons = {
    heart: "fa-solid fa-heart floating-heart",
    hug: "fa-solid fa-hands-holding floating-heart",
    cry: "fa-solid fa-droplet floating-heart",
  };

  // تولید انیمیشن
  for (let i = 0; i < 15; i++) {
    let icon = document.createElement("i");
    icon.className = icons[type];
    icon.style.left = Math.random() * 90 + 5 + "%";
    icon.style.animationDuration = Math.random() * 3 + 2 + "s";
    document.getElementById("cinematic-reader").appendChild(icon);
    setTimeout(() => icon.remove(), 5000);
  }

  fetch(BASE_URL + "/api/letter_reaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: currentLetterTitleForReact, reaction: type }),
  });
}

function paginateText(text, maxLength) {
  // جایگزینی موقت تگ‌های خط‌شکن برای جلوگیری از بریده شدن آن‌ها
  const raw = text.replace(/<br\s*\/?>/gi, " [BR] ");
  const words = raw.split(" ");
  const pages = [];
  let currentPage = "";

  words.forEach((word) => {
    if ((currentPage + word).length > maxLength && currentPage.trim() !== "") {
      pages.push(currentPage.replace(/ \[BR\] /g, "<br><br>").trim());
      currentPage = word + " ";
    } else {
      currentPage += word + " ";
    }
  });
  if (currentPage.trim().length > 0) {
    pages.push(currentPage.replace(/ \[BR\] /g, "<br><br>").trim());
  }
  return pages;
}

function renderBookPage() {
  const pageTextEl = document.getElementById("book-page-text");
  pageTextEl.style.animation = "none";
  pageTextEl.offsetHeight; /* Trigger reflow */
  pageTextEl.style.animation = "fadeInPage 0.8s ease forwards";

  pageTextEl.innerHTML = currentBookPages[currentPageIndex];
  document.getElementById("book-page-indicator").innerText =
    `صفحه ${currentPageIndex + 1} از ${currentBookPages.length}`;

  const prevBtn = document.getElementById("btn-prev-page");
  prevBtn.style.opacity = currentPageIndex > 0 ? "1" : "0.2";
  prevBtn.style.pointerEvents = currentPageIndex > 0 ? "auto" : "none";

  const nextBtn = document.getElementById("btn-next-page");
  nextBtn.style.opacity =
    currentPageIndex < currentBookPages.length - 1 ? "1" : "0.2";
  nextBtn.style.pointerEvents =
    currentPageIndex < currentBookPages.length - 1 ? "auto" : "none";
}

function changeBookPage(direction) {
  const newIndex = currentPageIndex + direction;
  if (newIndex >= 0 && newIndex < currentBookPages.length) {
    currentPageIndex = newIndex;
    renderBookPage();
  }
}

// ================= (پایان بخش نامه‌ها) =================

// ================= ارسال نامه از طریق پنل مدیریت =================
function toggleScheduleInput() {
  const type = document.getElementById("letter-notif-type").value;
  document.getElementById("schedule-container").style.display =
    type === "scheduled" ? "block" : "none";
}

// ================= ارسال نامه از طریق پنل مدیریت =================
function submitLetter() {
  const titleVal = document.getElementById("letter-title").value;
  const contentVal = document.getElementById("letter-content").value;
  const notifType = document.getElementById("letter-notif-type").value;
  const scheduleTime = document.getElementById("letter-schedule-time")
    ? document.getElementById("letter-schedule-time").value
    : null;
  const unlockDateInput = document.getElementById("letter-unlock-date");
  const unlockDate =
    unlockDateInput && unlockDateInput.value ? unlockDateInput.value : null;

  const msgBox = document.getElementById("admin-msg");

  if (!titleVal || !contentVal) {
    msgBox.style.color = "#ff4d4d";
    msgBox.innerText = "لطفاً هم عنوان و هم متن نامه را بنویسید.";
    return;
  }

  msgBox.style.color = "#94a3b8";
  msgBox.innerText = "در حال پردازش و آپدیت دیتابیس... ⏳";

  // هدایت هوشمند بین ساخت نامه جدید و ادیت نامه قبلی
  const endpoint = editingLetterId
    ? `/api/edit_letter/${editingLetterId}`
    : `/api/add_letter`;
  const method = editingLetterId ? `PUT` : `POST`;

  fetch(BASE_URL + endpoint, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: titleVal,
      content: contentVal,
      notif_type: notifType,
      scheduled_time: scheduleTime,
      unlock_date: unlockDate,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        msgBox.style.color = "#10b981";
        msgBox.innerText = data.message;
        setTimeout(() => {
          clearLetterForm();
          loadLetters(); // رفرش صندوقچه
          loadAdminLetters(); // رفرش لیست ادمین
          showSection("letters", document.querySelectorAll(".nav-item")[1]); // انتقال مستقیم به صندوقچه
        }, 2000);
      } else {
        msgBox.style.color = "#ff4d4d";
        msgBox.innerText = data.message;
      }
    })
    .catch((err) => {
      msgBox.style.color = "#ff4d4d";
      msgBox.innerText = "❌ خطا در برقراری ارتباط با سرور";
    });
}

// ================= توابع پنل مدیریت جامع =================

function switchAdminTab(tabName, event) {
  // تغییر استایل تب‌ها
  document
    .querySelectorAll(".admin-tab")
    .forEach((t) => t.classList.remove("active"));
  event.currentTarget.classList.add("active");

  // تغییر پنل محتوا
  document.querySelectorAll(".admin-content-pane").forEach((p) => {
    p.classList.remove("active-pane");
    p.classList.add("hidden-pane");
  });
  document
    .getElementById("admin-tab-" + tabName)
    .classList.remove("hidden-pane");
  document.getElementById("admin-tab-" + tabName).classList.add("active-pane");

  // بارگذاری هوشمند اطلاعات
  if (tabName === "letters-mgr") loadAdminLetters();
  if (tabName === "events-mgr") loadAdminEvents();
  if (tabName === "memories-mgr") loadAdminMemories();
  if (tabName === "vault-mgr") loadAdminVault();
  if (tabName === "songs-mgr") loadAdminSongs();
  if (tabName === "echoes-mgr") loadAdminEchoes();
}

// موتور واحد برای حذف موجودیت‌ها
function executeAdminDelete(endpoint, id, reloadCallback) {
  if (
    confirm(
      "⚠️ آیا از حذف دائمی این مورد اطمینان دارید؟ این عملیات غیرقابل بازگشت است.",
    )
  ) {
    fetch(`${BASE_URL}/api/${endpoint}/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") reloadCallback();
        else alert("❌ خطا در حذف داده.");
      })
      .catch((e) => alert("❌ ارتباط با سرور قطع شد."));
  }
}

let editingLetterId = null;

function loadAdminLetters() {
  const container = document.getElementById("admin-letters-list");
  container.innerHTML =
    "<p class='text-muted'>در حال استخراج داده‌ها... ⏳</p>";

  fetch(BASE_URL + "/api/letters")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        container.innerHTML = data.data
          .map((l) => {
            const readTimeStr = l.read_at
              ? ` <span style="font-size: 0.75rem; opacity: 0.8;">(${l.read_at})</span>`
              : "";
            const readStatus = l.is_read
              ? `<span style="color:var(--green-main);">👁️ خوانده شده${readTimeStr}</span>`
              : `<span style="color:var(--orange-main);">💌 نخوانده</span>`;

            let lockStatus = "";
            if (l.unlock_date) {
              const unlockTime = new Date(l.unlock_date).getTime();
              if (new Date().getTime() < unlockTime) {
                const dObj = new Date(l.unlock_date);
                const fd =
                  dObj.toLocaleDateString("fa-IR") +
                  " " +
                  dObj.toLocaleTimeString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                lockStatus = `<br><span style="color:#ff4d4d; font-size:0.8rem; margin-top:5px; display:inline-block;"><i class="fa-solid fa-lock"></i> وضعیت: قفل شده تا ${fd}</span>`;
              }
            }

            const editedStatus = l.edited_at
              ? `<br><span style="color:#0ea5e9; font-size:0.8rem; margin-top:5px; display:inline-block;"><i class="fa-solid fa-pen"></i> آخرین ویرایش: ${l.edited_at}</span>`
              : "";

            return `
                  <div class="admin-list-item">
                      <div class="admin-list-info">
                          <h4>${l.title}</h4>
                          <p><i class="fa-regular fa-clock"></i> ${l.date} &nbsp;|&nbsp; 
                          ${l.type === "scheduled" ? "⏳ زمان‌دار" : l.type === "silent" ? "🔕 بی‌صدا" : "🔔 عادی"}
                          &nbsp;|&nbsp; ${readStatus} ${lockStatus} ${editedStatus}</p>
                      </div>
                      <div class="admin-action-group" style="display:flex; gap:8px;">
                          <button class="admin-edit-btn" onclick="editLetterSetup(${l.id})" title="ویرایش نامه"><i class="fa-solid fa-pen-to-square"></i></button>
                          <button class="admin-delete-btn" onclick="executeAdminDelete('delete_letter', ${l.id}, loadAdminLetters)" title="حذف این نامه"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                  </div>
              `;
          })
          .join("");
      }
    });
}

// لود کردن نامه برای ادیت و پرش قطعی به صفحه مستقل استودیو
function editLetterSetup(id) {
  fetch(BASE_URL + "/api/letter/" + id + "?role=admin")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        const l = data.data;

        // پر کردن فیلدها با اطلاعات نامه
        document.getElementById("letter-title").value = l.title;
        document.getElementById("letter-content").value = l.content.replace(
          /<br>/g,
          "\n",
        );

        editingLetterId = id; // ست کردن وضعیت روی حالت ادیت

        // تغییر ظاهر دکمه انتشار
        const submitBtn = document.querySelector(
          'button[onclick="submitLetter()"]',
        );
        if (submitBtn) {
          submitBtn.innerHTML =
            '<i class="fa-solid fa-arrows-rotate"></i> ذخیره تغییرات و آپدیت';
        }

        // 🔴 راه حل قطعی: انتقال مستقیم به صفحه (Section) مستقل استودیو
        const studioNavBtn = document.getElementById("nav-studio-btn");
        showSection("studio", studioNavBtn);

        // نمایش پیام راهنما در استودیو
        const msgBox = document.getElementById("admin-msg");
        if (msgBox) {
          msgBox.innerText =
            "در حال ویرایش نامه... (اگر می‌خواهی نامه قفل بماند، تاریخ کپسول را مجدداً ست کن)";
          msgBox.style.color = "var(--orange-main)";
        }
      }
    })
    .catch((err) => console.error("خطا در دریافت اطلاعات نامه:", err));
}

function clearLetterForm() {
  document.getElementById("letter-title").value = "";
  document.getElementById("letter-content").value = "";
  if (document.getElementById("letter-schedule-time"))
    document.getElementById("letter-schedule-time").value = "";
  if (document.getElementById("letter-unlock-date"))
    document.getElementById("letter-unlock-date").value = "";
  document.getElementById("admin-msg").innerText = "";

  editingLetterId = null;
  const submitBtn = document.querySelector('button[onclick="submitLetter()"]');
  if (submitBtn) submitBtn.innerHTML = "انتشار نامه";
}

// --- مدیریت رویدادها ---
function loadAdminEvents() {
  const container = document.getElementById("admin-events-list");
  container.innerHTML =
    "<p class='text-muted'>در حال استخراج داده‌ها... ⏳</p>";
  fetch(BASE_URL + "/api/admin/events")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        if (data.data.length === 0) {
          container.innerHTML =
            "<p class='text-orange'>هیچ تاریخی ثبت نشده است.</p>";
          return;
        }
        container.innerHTML = data.data
          .map(
            (e) => `
                  <div class="admin-list-item">
                      <div class="admin-list-info">
                          <h4>${e.title}</h4>
                          <p class="text-green">${e.date}</p>
                      </div>
                      <div class="admin-action-group" style="display:flex; gap:8px;">
                          <button class="admin-edit-btn" onclick="editEventSetup(${e.id}, \`${e.title}\`, \`${e.date}\`)" title="ویرایش تاریخ"><i class="fa-solid fa-pen-to-square"></i></button>
                          <button class="admin-delete-btn" onclick="executeAdminDelete('admin/events', ${e.id}, loadAdminEvents)" title="حذف این تاریخ"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                  </div>
              `,
          )
          .join("");
      } else {
        container.innerHTML = `<p class='text-orange'>❌ ${data.message}</p>`;
      }
    });
}

function submitEvent() {
  const title = document.getElementById("new-event-title").value;
  const dateStr = document.getElementById("new-event-date").value;
  if (!title || !dateStr)
    return alert("لطفاً هم عنوان و هم تاریخ را وارد کنید.");

  const endpoint = editingEventId
    ? `/api/admin/events/${editingEventId}`
    : `/api/admin/events`;
  const method = editingEventId ? `PUT` : `POST`;

  fetch(BASE_URL + endpoint, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, date_str: dateStr }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.status === "success") {
        document.getElementById("new-event-title").value = "";
        document.getElementById("new-event-date").value = "";
        document.getElementById("btn-save-event").innerText = "ثبت تاریخ";
        editingEventId = null;
        loadAdminEvents(); // رفرش لیست
      } else alert(d.message);
    });
}

// --- مدیریت و ادیت رویدادها ---
let editingEventId = null;

function editEventSetup(id, title, date) {
  document.getElementById("new-event-title").value = title;
  document.getElementById("new-event-date").value = date;
  editingEventId = id;
  document.getElementById("btn-save-event").innerHTML =
    '<i class="fa-solid fa-arrows-rotate"></i> آپدیت تاریخ';
}

// --- مدیریت، ویرایش و حذف خاطرات در پنل ادمین ---
function loadAdminMemories() {
  const container = document.getElementById("admin-memories-list");
  if (!container) return;
  container.innerHTML =
    "<p class='text-muted'>در حال استخراج داده‌ها از دیتابیس... ⏳</p>";

  fetch(BASE_URL + "/api/admin/memories")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        if (data.data.length === 0) {
          container.innerHTML =
            "<p class='text-orange'>صندوقچه خاطرات خالی است.</p>";
          return;
        }

        container.innerHTML = data.data
          .map((m) => {
            const icon =
              m.media_type === "photo"
                ? "fa-image"
                : m.media_type === "video"
                  ? "fa-video"
                  : "fa-microphone-lines";

            // ایمن‌سازی دیتای متنی برای انتقال به تابع جاوااسکریپت (جلوگیری از باگ کوتیشن‌ها)
            const safeDesc = m.description
              ? m.description
                  .replace(/"/g, "&quot;")
                  .replace(/\n/g, "\\n")
                  .replace(/'/g, "\\'")
              : "";
            const safeDate = m.memory_date
              ? m.memory_date.replace(/"/g, "&quot;").replace(/'/g, "\\'")
              : "";

            return `
                <div class="admin-list-item">
                    <div class="admin-list-info">
                        <h4><i class="fa-solid ${icon} text-orange"></i> سیاره شماره #${m.id}</h4>
                        <p>مدار: ${m.category} ${m.memory_date ? `| 📅 ${m.memory_date}` : ""}</p>
                    </div>
                    <div class="admin-action-group" style="display:flex; gap:8px;">
                        <button class="admin-edit-btn" onclick="editMemorySetup(${m.id}, '${m.category}', '${safeDate}', '${safeDesc}')" title="ویرایش داستان و تاریخ"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="admin-delete-btn" onclick="executeAdminDelete('admin/memories', ${m.id}, loadAdminMemories)" title="حذف این خاطره"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
          })
          .join("");
      } else {
        container.innerHTML = `<p class='text-orange'>❌ ${data.message}</p>`;
      }
    });
}

function editMemorySetup(id, category, date, desc) {
  document.getElementById("memory-edit-form").style.display = "block";
  document.getElementById("edit-mem-id").value = id;
  document.getElementById("edit-mem-cat").value = category;
  document.getElementById("edit-mem-date").value = date;
  document.getElementById("edit-mem-desc").value = desc.replace(/\\n/g, "\n");

  // اسکرول نرم به بالای بخش مدیریت خاطرات برای دیدن فرم
  const activeSection = document.querySelector(".app-section.active-section");
  if (activeSection) activeSection.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMemoryEdit() {
  document.getElementById("memory-edit-form").style.display = "none";
  document.getElementById("edit-mem-id").value = "";
  document.getElementById("edit-mem-cat").value = "";
  document.getElementById("edit-mem-date").value = "";
  document.getElementById("edit-mem-desc").value = "";
}

function submitMemoryEdit() {
  const id = document.getElementById("edit-mem-id").value;
  const category = document.getElementById("edit-mem-cat").value;
  const date = document.getElementById("edit-mem-date").value;
  const desc = document.getElementById("edit-mem-desc").value;

  if (!id) return;

  const btn = document.querySelector("#memory-edit-form .btn-save");
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ذخیره...';

  fetch(BASE_URL + "/api/admin/memories/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: category,
      memory_date: date,
      description: desc,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> ذخیره تغییرات';
      if (data.status === "success") {
        closeMemoryEdit();
        loadAdminMemories(); // رفرش لیست ادمین
        if (typeof loadGallery === "function") loadGallery(); // رفرش گالری در پس‌زمینه

        // ساخت یک پیام پاپ‌آپِ کوچک و شیک برای موفقیت
        const toast = document.createElement("div");
        toast.className = "capsule-toast";
        toast.innerHTML = `✅ اطلاعات سیاره با موفقیت آپدیت شد!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        alert("❌ خطا: " + data.message);
      }
    })
    .catch((e) => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> ذخیره تغییرات';
      alert("❌ خطا در برقراری ارتباط");
    });
}

function loadAdminSongs() {
  const container = document.getElementById("admin-songs-list");
  container.innerHTML =
    "<p class='text-muted'>در حال استخراج داده‌ها... ⏳</p>";
  fetch(BASE_URL + "/api/admin/songs")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        if (data.data.length === 0) {
          container.innerHTML = "<p class='text-orange'>پلی‌لیست خالی است.</p>";
          return;
        }
        container.innerHTML = data.data
          .map(
            (s) => `
                <div class="admin-list-item">
                    <div class="admin-list-info">
                        <h4><i class="fa-solid fa-music text-green"></i> ${s.title}</h4>
                    </div>
                    <button class="admin-delete-btn" onclick="executeAdminDelete('admin/songs', ${s.id}, loadAdminSongs)" title="حذف این آهنگ"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `,
          )
          .join("");
      } else {
        container.innerHTML = `<p class='text-orange'>❌ ${data.message}</p>`;
      }
    })
    .catch(
      (e) =>
        (container.innerHTML = "<p class='text-orange'>❌ خطا در ارتباط</p>"),
    );
}

// افکت لرزش برای نامه‌های قفل شده
function handleLockedLetter(element, message) {
  element.classList.add("shake-animation");
  setTimeout(() => element.classList.remove("shake-animation"), 400);
  const toast = document.createElement("div");
  toast.className = "capsule-toast";
  toast.innerHTML = `<i class="fa-solid fa-clock"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ================= فاز ۳ پیشرفته: موتور گالری کهکشانی و رندرینگ سیاره‌ها =================
let allMemories = [];

function loadGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return;

  // تغییر کلاس کانتینر برای هماهنگی با CSS جدید
  container.className = "galactic-space";
  container.innerHTML =
    "<p class='text-muted' style='width:100%; text-align:center;'>در حال رصد ستاره‌ها در کهکشان... 🔭</p>";

  fetch(BASE_URL + "/api/gallery_memories")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        allMemories = data.data;
        renderGallery("all");
      } else {
        container.innerHTML = `<p class="text-orange" style='width:100%; text-align:center;'>❌ اختلال در رصدخانه</p>`;
      }
    });
}

function renderGallery(filter) {
  const container = document.getElementById("gallery-container");
  if (allMemories.length === 0) {
    container.innerHTML = `<div class="glass-panel text-center empty-state" style="width: 100%;"><i class="fa-solid fa-meteor text-orange"></i><p style="margin-top:15px;">فضای کهکشان هنوز خالی است...</p></div>`;
    return;
  }

  let filtered =
    filter === "all"
      ? allMemories
      : allMemories.filter((m) => m.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="width: 100%; text-align: center; margin-top: 40px;"><p class="text-muted" style="font-size: 1.1rem;">هیچ سیاره‌ای در این مدار یافت نشد.</p></div>`;
    return;
  }

  container.innerHTML = filtered
    .map((m) => {
      let mediaTag = "";
      let typeIcon = "";

      // رندرینگ هوشمند سطح سیاره
      if (m.type === "photo") {
        mediaTag = `<img src="${BASE_URL}/api/media/${m.file_id}" class="celestial-media" loading="lazy" alt="planet" />`;
        typeIcon = "fa-image";
      } else if (m.type === "video") {
        mediaTag = `<video src="${BASE_URL}/api/media/${m.file_id}" class="celestial-media" preload="metadata" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>`;
        typeIcon = "fa-video";
      } else {
        // سیاره‌ی اختصاصی برای وویس‌ها با اکولایزر گرافیکی
        mediaTag = `<div class="celestial-media" style="background: radial-gradient(circle at center, #2c3e50, #000); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color:var(--orange-main);"><i class="fa-solid fa-microphone-lines music-pulse"></i></div>`;
        typeIcon = "fa-microphone-lines";
      }

      return `
            <div class="celestial-body" onclick="viewMediaFull(${m.id})">
                ${mediaTag}
                <div class="celestial-ring"></div>
                <div style="position:absolute; bottom:12%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); padding:3px 10px; border-radius:12px; font-size:0.75rem; color:var(--text-main); display:flex; gap:5px; align-items:center; border: 1px solid rgba(255,255,255,0.1);">
                    <i class="fa-solid ${typeIcon}"></i> ${m.category}
                </div>
            </div>
        `;
    })
    .join("");
}

function filterGallery(cat, event) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (event) event.currentTarget.classList.add("active");
  renderGallery(cat);
}

// فرود روی سیاره (نمایش جزئیات و متا‌دیتا)
function viewMediaFull(id) {
  const m = allMemories.find((x) => x.id === id);
  if (!m) return;

  const src = `${BASE_URL}/api/media/${m.file_id}`;
  let mediaContent = "";
  const globalAudioControl = `onplay="if(typeof globalAudio !== 'undefined' && !globalAudio.paused){wasGlobalPlaying=true; globalAudio.pause(); const gi=document.getElementById('global-play-icon'); if(gi) gi.className='fa-solid fa-play';}" onended="if(wasGlobalPlaying && typeof globalAudio !== 'undefined'){globalAudio.play(); const gi=document.getElementById('global-play-icon'); if(gi) gi.className='fa-solid fa-pause'; wasGlobalPlaying=false;}"`;

  // بخش رسانه
  if (m.type === "photo") {
    mediaContent = `<img src="${src}" style="width:100%; max-height:55vh; object-fit:contain; border-radius:15px; box-shadow:0 0 30px rgba(249, 123, 34, 0.2); display:block; margin:0 auto;">`;
  } else if (m.type === "video") {
    mediaContent = `<video src="${src}" controls autoplay ${globalAudioControl} style="width:100%; max-height:55vh; border-radius:15px; box-shadow:0 0 30px rgba(124, 144, 112, 0.2); outline: none; display:block; margin:0 auto;"></video>`;
  } else {
    const songId = `modal_mem_${m.id}`;
    mediaContent = `
        <div style="padding: 20px 10px; text-align: center;">
            <i class="fa-solid fa-microphone-lines music-pulse" style="font-size: 3.5rem; color: var(--orange-main); margin-bottom: 25px;"></i>
            <div class="custom-player-card" style="margin-bottom: 0; text-align: right;">
                <div class="player-controls" dir="ltr" style="background: rgba(0,0,0,0.6);">
                    <button class="play-btn" onclick="togglePlay('${songId}')" style="width: 45px; height: 45px;">
                        <i id="play-icon-${songId}" class="fa-solid fa-pause"></i>
                    </button>
                    <div class="progress-container" id="progress-container-${songId}" onclick="seekAudio(event, '${songId}')">
                        <div class="progress-bar" id="progress-${songId}"></div>
                    </div>
                    <span class="time-display" id="time-${songId}">0:00 / 0:00</span>
                </div>
                <audio id="audio-${songId}" src="${src}" autoplay ${globalAudioControl} ontimeupdate="updateProgress('${songId}')" onended="audioEnded('${songId}')"></audio>
            </div>
        </div>`;
  }

  // بخش متادیتا (اطلاعات دینامیک)
  let metaHtml = "";
  if (m.memory_date) {
    metaHtml += `<div class="planet-date"><i class="fa-regular fa-calendar-days"></i> ثبت شده در: ${m.memory_date}</div>`;
  }

  if (m.description && m.description.trim() !== "") {
    metaHtml += `<div class="planet-story">${m.description.replace(/\n/g, "<br>")}</div>`;
  } else {
    metaHtml += `<div class="planet-empty-story">این سیاره فعلاً خاموش است و داستانی برای روایت ندارد...</div>`;
  }

  const contentHtml = `
        <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
            ${mediaContent}
            <div class="planet-details-box">
                ${metaHtml}
            </div>
        </div>
    `;
  openModal(`کاوش در سیاره ${m.category} 🚀`, contentHtml);
}

// الگوریتم یادآوری هوشمند (On This Day / Memory Lane)
// ================= الگوریتم یادآوری خودکار (Memory Lane) =================
function loadMemoryLane() {
  const container = document.getElementById("memory-lane-container");
  if (!container) return;

  // اطمینان از اینکه دیتای کل گالری به صورت خاموش لود شده است
  // تا وقتی کاربر روی کادر کلیک کرد، تابع viewMediaFull بتواند سیاره را پیدا کند
  if (typeof allMemories !== "undefined" && allMemories.length === 0) {
    fetch(BASE_URL + "/api/gallery_memories")
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") allMemories = d.data;
      });
  }

  fetch(BASE_URL + "/api/memory_lane")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success" && data.data) {
        const d = data.data;
        const timeText = d.date
          ? `مربوط به تاریخ ${d.date}`
          : `در دسته‌بندی ${d.category}`;
        container.innerHTML = `
                    <div class="memory-lane-card" onclick="viewMediaFull(${d.id})">
                        <div class="memory-lane-icon"><i class="fa-solid fa-meteor"></i></div>
                        <div class="memory-lane-text">
                            <h3>یادت هست؟ ✨</h3>
                            <p>یک قاب ماندگار ${timeText} از دل کهکشان پیدا شد... روی این شهاب‌سنگ کلیک کن تا سیاره‌اش را دوباره کاوش کنیم.</p>
                        </div>
                    </div>
                `;
      }
    });
}

// برای اینکه دقیقاً لحظه‌ی لاگین هم تونل زمان لود شود，
// در تابع attemptLogin و بخش DOMContentLoaded (ورود خودکار) هم می‌توانید loadMemoryLane() را صدا بزنید.

// ================= فاز ۵: سیستم امنیتی گاوصندوق رازها =================
function loadVaultQuestion() {
  const qText = document.getElementById("vault-question-text");
  document.getElementById("vault-answer-input").value = "";
  document.getElementById("vault-msg").innerText = "";

  // ریست کردن ظاهر گاوصندوق
  document
    .getElementById("vault-challenge-area")
    .classList.remove("hidden-view");
  document.getElementById("vault-revealed-area").classList.add("hidden-view");
  document.getElementById("vault-icon").className =
    "fa-solid fa-lock vault-icon text-orange";
  document.querySelector(".vault-container").classList.remove("unlocked-mode");

  fetch(BASE_URL + "/api/vault/question")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") qText.innerText = data.question;
      else qText.innerText = "ارتباط با گاوصندوق قطع شده است.";
    });
}

function attemptUnlockVault() {
  const answer = document.getElementById("vault-answer-input").value;
  const msgBox = document.getElementById("vault-msg");
  const icon = document.getElementById("vault-icon");

  if (!answer) {
    msgBox.style.color = "#ff4d4d";
    msgBox.innerText = "لطفاً پاسخی وارد کن!";
    return;
  }
  msgBox.style.color = "#94a3b8";
  msgBox.innerText = "در حال بررسی تطابق کلید... ⏳";

  fetch(BASE_URL + "/api/vault/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer: answer }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        // قفل باز شد!
        msgBox.innerText = "";
        icon.className = "fa-solid fa-lock-open vault-icon unlocked";
        document
          .querySelector(".vault-container")
          .classList.add("unlocked-mode");

        document
          .getElementById("vault-challenge-area")
          .classList.add("hidden-view");
        const revealArea = document.getElementById("vault-revealed-area");
        revealArea.classList.remove("hidden-view");

        // نمایش محتوای سکرت با تبدیل اینتر به خط‌شکن
        document.getElementById("vault-secret-content").innerHTML =
          data.content.replace(/\n/g, "<br>");

        // افکت باران قلب
        sendReaction("heart", document.createElement("div"));
      } else {
        // پاسخ اشتباه (لرزش قفل)
        msgBox.style.color = "#ff4d4d";
        msgBox.innerText = data.message;
        icon.classList.add("shake-animation");
        setTimeout(() => icon.classList.remove("shake-animation"), 400);
      }
    })
    .catch(() => {
      msgBox.style.color = "#ff4d4d";
      msgBox.innerText = "❌ خطا در سرور";
    });
}

// توابع پنل ادمین برای گاوصندوق
function loadAdminVault() {
  fetch(BASE_URL + "/api/admin/vault")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        document.getElementById("admin-vault-q").value = data.data.question;
        document.getElementById("admin-vault-a").value = data.data.answer;
        document.getElementById("admin-vault-c").value = data.data.content;
      }
    });
}

function saveAdminVault() {
  const q = document.getElementById("admin-vault-q").value;
  const a = document.getElementById("admin-vault-a").value;
  const c = document.getElementById("admin-vault-c").value;

  if (!q || !a || !c) return alert("لطفاً تمام فیلدهای گاوصندوق را پر کنید.");

  fetch(BASE_URL + "/api/admin/vault", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: q, answer: a, secret_content: c }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") alert("✅ " + data.message);
      else alert("❌ خطا: " + data.message);
    });
}

// ================= فاز ۶: پژواک کهکشان و رادار هوشمند =================

// --- بخش سمت پارتنر (ارسال) ---
function switchEchoMode(mode, btn) {
  document
    .querySelectorAll("#section-echo .admin-tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  if (mode === "text") {
    document.getElementById("echo-text-mode").style.display = "block";
    document.getElementById("echo-voice-mode").style.display = "none";
  } else {
    document.getElementById("echo-text-mode").style.display = "none";
    document.getElementById("echo-voice-mode").style.display = "block";
  }
}

function sendEchoText() {
  const text = document.getElementById("echo-text-input").value;
  if (!text.trim()) return alert("لطفاً متنی بنویسید.");

  const btn = document.querySelector("#echo-text-mode .btn-gradient");
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';

  fetch(BASE_URL + "/api/echo/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  })
    .then((r) => r.json())
    .then((data) => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> رها کردن در فضا';
      if (data.status === "success") {
        alert(data.message);
        document.getElementById("echo-text-input").value = "";
      } else alert("❌ خطا در ارسال");
    });
}

// --- موتور MediaRecorder ایمن (حل قطعی باگ فایل بی‌صدا و نویز) ---
let mediaRecorder;
let audioChunks = [];
let recordInterval;
let recordSeconds = 0;
let activeStream = null;
let finalAudioBlob = null; // متغیر گلوبال برای ذخیره فایل یکپارچه

function toggleRecording() {
  const btn = document.getElementById("btn-record-toggle");
  const status = document.getElementById("echo-voice-status");
  const indicator = document.getElementById("recording-indicator");
  const timerEl = document.getElementById("record-timer");
  const sendBtn = document.getElementById("btn-send-voice");

  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    clearInterval(recordInterval);

    // خاموش کردن کامل سخت‌افزار میکروفون
    if (activeStream) activeStream.getTracks().forEach((track) => track.stop());

    btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    btn.style.background = "var(--green-main)";
    indicator.style.display = "none";
    return;
  }

  // تنظیمات پیشرفته برای حذف خش‌خش، نویز محیط و اکو
  const audioConstraints = {
    audio: {
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
    },
  };

  navigator.mediaDevices
    .getUserMedia(audioConstraints)
    .then((stream) => {
      activeStream = stream;
      // اجازه می‌دهیم مرورگر پایدارترین فرمت خودش را بسازد
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      // ساخت فایل نهایی فقط زمانی که ضبط کاملاً متوقف شد
      mediaRecorder.onstop = () => {
        finalAudioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        status.innerText = "صدا با موفقیت ضبط شد. می‌توانی ارسال کنی.";
        sendBtn.style.display = "inline-block";
      };

      // شروع ضبط یکپارچه
      mediaRecorder.start();
      recordSeconds = 0;
      timerEl.innerText = "00:00";

      btn.innerHTML = '<i class="fa-solid fa-stop"></i>';
      btn.style.background = "#ff4d4d";
      indicator.style.display = "block";
      status.innerText = "";
      sendBtn.style.display = "none";

      recordInterval = setInterval(() => {
        recordSeconds++;
        const m = String(Math.floor(recordSeconds / 60)).padStart(2, "0");
        const s = String(recordSeconds % 60).padStart(2, "0");
        timerEl.innerText = `${m}:${s}`;
      }, 1000);
    })
    .catch((err) => {
      console.error(err);
      alert(
        "❌ دسترسی به میکروفون مسدود است. لطفاً سایت را روی Localhost یا سرور اجرا کنید.",
      );
    });
}

function sendEchoVoice() {
  if (!finalAudioBlob) return alert("هیچ صدایی ضبط نشده است.");

  const sendBtn = document.getElementById("btn-send-voice");
  sendBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> در حال آپلود...';

  const formData = new FormData();
  let ext = "webm";
  if (finalAudioBlob.type.includes("mp4")) ext = "m4a";
  if (finalAudioBlob.type.includes("ogg")) ext = "ogg";

  formData.append("audio", finalAudioBlob, `voice.${ext}`);

  fetch(BASE_URL + "/api/echo/send", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((data) => {
      sendBtn.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> ارسال صدای ضبط شده';
      if (data.status === "success") {
        alert(data.message);
        sendBtn.style.display = "none";
        document.getElementById("echo-voice-status").innerText =
          "برای شروع ضبط مجدد کلیک کن";
        audioChunks = [];
        finalAudioBlob = null;
      } else alert("❌ خطا در آپلود فایل صوتی");
    })
    .catch((e) => {
      sendBtn.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> ارسال صدای ضبط شده';
      alert("❌ خطا در ارتباط با سرور");
    });
}
// --- پایان موتور MediaRecorder ---

// --- بخش سمت ادمین (رادار و دریافت) ---
let radarInterval = null;
let lastUnreadCount = 0;

// --- آپدیت سرعت رادار ---
function startAdminRadar() {
  if (localStorage.getItem("elysium_user") !== "matin") return;

  // سرعت رادار را از ۳۰ ثانیه به ۱۰ ثانیه کاهش دادیم تا سریع‌تر پاپ‌آپ بیاید
  if (!radarInterval) {
    radarInterval = setInterval(checkUnreadEchoes, 10000);
    checkUnreadEchoes();
  }
}

function checkUnreadEchoes() {
  fetch(BASE_URL + "/api/admin/echoes/unread")
    .then((r) => r.json())
    .then((data) => {
      if (
        data.status === "success" &&
        data.unread_count > 0 &&
        data.unread_count > lastUnreadCount
      ) {
        lastUnreadCount = data.unread_count;
        document
          .getElementById("admin-top-notification")
          .classList.add("show-notif");

        // پخش یک افکت صوتی نرم برای جلب توجه (اختیاری)
        try {
          new Audio(
            "https://actions.google.com/sounds/v1/water/droplet.ogg",
          ).play();
        } catch (e) {}
      }
    });
}

function closeAdminNotif() {
  document
    .getElementById("admin-top-notification")
    .classList.remove("show-notif");
}

function loadAdminEchoes() {
  const container = document.getElementById("admin-echoes-list");
  if (!container) return;
  container.innerHTML = "<p class='text-muted'>در حال اسکن فرکانس‌ها... ⏳</p>";

  fetch(BASE_URL + "/api/admin/echoes")
    .then((r) => r.json())
    .then((data) => {
      // ریست کردن شمارشگر پاپ‌آپ چون الان وارد صفحه شده و خوانده می‌شوند
      lastUnreadCount = 0;

      if (data.status === "success") {
        if (data.data.length === 0) {
          container.innerHTML = "<p class='text-orange'>رادار خالی است.</p>";
          return;
        }

        container.innerHTML = data.data
          .map((e) => {
            const unreadClass = e.is_read ? "" : "unread";
            const newBadge = e.is_read
              ? ""
              : `<span style="background:var(--orange-main); color:#000; padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:bold; margin-right:10px;">جدید</span>`;

            let contentHtml = "";
            if (e.type === "text") {
              contentHtml = `<p class="echo-text-content"><i class="fa-solid fa-quote-right text-orange" style="opacity:0.5; margin-left:5px;"></i> ${e.content.replace(/\n/g, "<br>")}</p>`;
            } else {
              const songId = `echo_voice_${e.id}`;
              contentHtml = `
                    <div class="custom-player-card" style="margin-top:10px;">
                        <div class="player-controls" dir="ltr">
                            <button class="play-btn" onclick="togglePlay('${songId}')"><i id="play-icon-${songId}" class="fa-solid fa-play"></i></button>
                            <div class="progress-container" id="progress-container-${songId}" onclick="seekAudio(event, '${songId}')">
                                <div class="progress-bar" id="progress-${songId}"></div>
                            </div>
                            <span class="time-display" id="time-${songId}">0:00 / 0:00</span>
                        </div>
                        <audio id="audio-${songId}" src="${BASE_URL}/uploads/${e.content}" preload="metadata" ontimeupdate="updateProgress('${songId}')" onended="audioEnded('${songId}')"></audio>
                    </div>`;
            }

            return `
                <div class="echo-card ${unreadClass}">
                    <span class="echo-card-date"><i class="fa-regular fa-clock"></i> ${e.date} ${newBadge}</span>
                    ${contentHtml}
                </div>`;
          })
          .join("");
      }
    });
}

// روشن کردن رادار ادمین هنگام لود شدن سایت
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("elysium_user") === "matin") startAdminRadar();
});

// ================= فاز ۷: راز مخفی و بازی‌سازی (The Konami Code) =================
let logoClickCount = 0;
let logoClickTimer = null;
let isEasterEggUnlocked = false; // جلوگیری از اجرای چندباره

document.addEventListener("DOMContentLoaded", () => {
  const secretLogo = document.getElementById("secret-logo");

  if (secretLogo) {
    secretLogo.addEventListener("click", () => {
      if (isEasterEggUnlocked) return; // اگر قبلاً باز شده، دیگر کاری نکن

      logoClickCount++;

      // اگر اولین کلیک بود، یک تایمر 3.5 ثانیه‌ای استارت بزن
      if (logoClickCount === 1) {
        logoClickTimer = setTimeout(() => {
          logoClickCount = 0; // اگر توی 3 ثانیه 7 تا کلیک نکرد، صفرش کن
        }, 3500);
      }

      // اگر به 7 کلیک رسید!
      if (logoClickCount === 7) {
        clearTimeout(logoClickTimer);
        logoClickCount = 0;
        triggerEasterEgg();
      }
    });
  }
});

function triggerEasterEgg() {
  isEasterEggUnlocked = true;

  // ۱. پخش یک افکت صوتی جادویی (متصل به سیستم قطع سراسری)
  try {
    if (window.magicAudio) {
      window.magicAudio.pause();
      window.magicAudio.currentTime = 0;
    }
    window.magicAudio = new Audio(BASE_URL + "/magic.mp3");
    window.magicAudio.volume = 0.6;
    window.magicAudio.play().catch((e) => {});
  } catch (e) {}

  // ۲. تغییر تم کل سایت به طلایی!
  document.body.classList.add("golden-theme");

  // ۳. باران ستاره‌های طلایی روی صفحه
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      let star = document.createElement("i");
      star.className = "fa-solid fa-star floating-heart";
      star.style.color = "#ffd700"; // طلایی
      star.style.left = Math.random() * 90 + 5 + "%";
      star.style.fontSize = Math.random() * 2 + 1 + "rem";
      star.style.filter = "drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))";
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 5000);
    }, i * 150); // با تاخیر می‌ریزند
  }

  // ۴. نمایش پیغامِ فوقِ محرمانه
  const secretHtml = `
        <div style="text-align: center; padding: 20px 0;">
            <i class="fa-solid fa-crown" style="font-size: 5rem; color: #ffd700; filter: drop-shadow(0 0 20px rgba(255,215,0,0.6)); margin-bottom: 25px; animation: goldPulse 2s infinite alternate;"></i>
            <h2 style="color: #ffd700; margin-bottom: 20px; font-size: 1.8rem;">رازِ کهکشان کشف شد! ✨</h2>
            <p style="color: #fff8e7; font-size: 1.15rem; line-height: 2; text-align: justify; text-align-last: center;">
                مطهره جان، تو دقیقاً ۷ بار روی قلبِ این سیستم کلیک کردی.<br>
                این یک کد مخفی بود بین من و خط‌به‌خطِ کدهای این سایت...<br><br>
                خواستم بدونی که حتی توی مخفی‌ترین و غیرقابل‌دسترس‌ترین بخش‌های این فضای دیجیتال هم، ردی از عشقِ تو وجود داره. 💛
            </p>
            <button class="btn-gradient" style="margin-top: 30px; background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; font-weight: bold; width: 80%;" onclick="closeDetail()">بوسه بر کهکشان 💋</button>
        </div>
    `;

  // با کمی تاخیر پیام را باز می‌کنیم تا اول افکت طلایی شدن سایت را ببیند
  setTimeout(() => {
    openModal("یک پیام مخفی از طرف متین... 🤫", secretHtml);
  }, 1500);
}

// ================= فاز ۷.۲: سیستم کلید طلایی و استمرار (Loyalty Streak) =================

function checkStreakAndRewards() {
  // فقط برای پارتنر فعال شود (ادمین نیازی به جایزه ندارد)
  if (localStorage.getItem("elysium_user") === "matin") return;

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  let streakData = JSON.parse(
    localStorage.getItem("elysium_streak") ||
      '{"lastDate": "", "count": 0, "keys": 0}',
  );

  if (streakData.lastDate === todayStr) {
    // امروز قبلاً محاسبه شده است
    updateKeyUI(streakData.keys);
    return;
  }

  // محاسبه اختلاف روز نسبت به آخرین بازدید
  if (streakData.lastDate) {
    const lastDateObj = new Date(streakData.lastDate);
    const todayObj = new Date(todayStr);
    const diffTime = todayObj - lastDateObj;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // بازدید متوالی! یک روز به استمرار اضافه شد
      streakData.count++;
    } else if (diffDays > 1) {
      // استک پرید و از نو شروع شد
      streakData.count = 1;
    }
  } else {
    streakData.count = 1;
  }

  streakData.lastDate = todayStr;

  // اگر استمرار به ۳ روز رسید، یک کلید طلایی هدیه بده!
  if (streakData.count >= 3) {
    streakData.keys++;
    streakData.count = 0; // ریست کردن شمارشگر برای دور بعدی
    triggerKeyRewardModal();
  }

  localStorage.setItem("elysium_streak", JSON.stringify(streakData));
  updateKeyUI(streakData.keys);
}

function updateKeyUI(keys) {
  const badge = document.getElementById("golden-key-badge");
  const countText = document.getElementById("key-count");
  if (badge && countText) {
    if (keys > 0) {
      badge.classList.remove("hidden-view");
      countText.innerText = `${keys} کلید طلایی`;
    } else {
      badge.classList.add("hidden-view");
    }
  }
}

function triggerKeyRewardModal() {
  const rewardHtml = `
        <div style="text-align: center; padding: 20px 0;">
            <i class="fa-solid fa-key" style="font-size: 4rem; color: #ffd700; filter: drop-shadow(0 0 20px rgba(255,215,0,0.8)); margin-bottom: 20px; animation: goldPulse 2s infinite alternate;"></i>
            <h3 style="color: #ffd700; margin-bottom: 15px;">تبریک عشق من! ✨</h3>
            <p style="color: var(--text-main); line-height: 1.8; font-size: 1.05rem;">
                تو ۳ روز متوالی به بهشتِ ما سر زدی. به پاس این استمرار و دلتنگیِ قشنگت، یک **کلید طلایی** به دست آوردی!<br>
                با این کلید می‌تونی هر کپسول زمانی که قفل شده رو فوراً و بدون انتظار باز کنی. 💛
            </p>
            <button class="btn-gradient" style="margin-top: 25px; background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; font-weight: bold;" onclick="closeDetail()">مرسی عشقم 🥰</button>
        </div>
    `;
  openModal("پاداش استمرار حضور 🔑", rewardHtml);
}

// تابع مصرف کلید طلایی برای باز کردن نامه قفل شده
function useGoldenKeyToUnlock(letterId) {
  let streakData = JSON.parse(
    localStorage.getItem("elysium_streak") || '{"keys": 0}',
  );
  if (streakData.keys > 0) {
    streakData.keys--;
    localStorage.setItem("elysium_streak", JSON.stringify(streakData));
    updateKeyUI(streakData.keys);

    // باز کردن نامه بدون محدودیت
    closeDetail();
    openLetter(letterId);
  } else {
    alert("کلید طلایی کافی نداری!");
  }
}

// اجرای تابع بررسی استمرار به محض ورود کاربر
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(checkStreakAndRewards, 1000);
});

// ================= فاز ۷.۳: سیستم جغد شب (Night Owl Mode) =================
function checkNightOwlMode() {
  // فقط برای مطهره اجرا شود (در پنل تو مزاحمتی ایجاد نکند)
  if (localStorage.getItem("elysium_user") === "matin") return;

  const currentHour = new Date().getHours();

  // استفاده از sessionStorage تا اگر همان شب صفحه را رفرش کرد، دوباره پاپ‌آپ نیاید
  const hasSeenNightOwl = sessionStorage.getItem("night_owl_seen");

  // بین ساعت 2 تا 4:59 صبح
  if (currentHour >= 2 && currentHour < 5 && !hasSeenNightOwl) {
    // ۱. فعال کردن تم شبانه با ۲ ثانیه تاخیر (برای ایجاد حس غافلگیری نرم)
    setTimeout(() => {
      document.body.classList.add("night-owl-theme");
    }, 1000);

    // ۲. علامت‌گذاری به عنوان دیده شده
    sessionStorage.setItem("night_owl_seen", "true");

    // ۳. ساخت محتوای پاپ‌آپ رمانتیک
    const owlHtml = `
            <div style="text-align: center; padding: 20px 0;">
                <i class="fa-solid fa-moon" style="font-size: 4.5rem; color: #a3bffa; margin-bottom: 25px; animation: moonPulse 3s infinite alternate;"></i>
                <h2 style="color: #a3bffa; margin-bottom: 20px; font-size: 1.6rem;">خوابت نمی‌بره عزیزم؟ 🌙</h2>
                <p style="color: var(--text-main); font-size: 1.1rem; line-height: 2; text-align: justify; text-align-last: center;">
                    نمی‌دونم الان داری به چی فکر می‌کنی یا چی تو دلت می‌گذره که تا این موقعِ شب بیداری...<br>
                    ولی خواستم از طریقِ کدهای این سیستم بهت بگم که من همیشه اینجام، حتی توی سکوتِ شب.<br><br>
                    بیا چشم‌هات رو ببند و این آهنگ رو با هم گوش بدیم... 💙
                </p>
                <button class="btn-gradient" style="margin-top: 30px; background: linear-gradient(45deg, #293462, #a3bffa); color: #fff; font-weight: bold; width: 80%;" onclick="closeDetail(); showRandomSong();">پخش یک آهنگ آرامش‌بخش 🎧</button>
            </div>
        `;

    // ۴. باز کردن پاپ‌آپ با تاخیر (تا تم کامل لود شود)
    setTimeout(() => {
      openModal("همدم شب‌های تو...", owlHtml);
    }, 2500);
  }
}

// ================= فاز ۸: تعاملات عمیق و بازی‌سازی پیشرفته =================

// --- ۱. تلاقی ارواح (Live Soul Sync) ---
let soulSyncInterval = null;

function startSoulSyncPing() {
  const user = localStorage.getItem("elysium_user");
  if (!user) return;

  if (!soulSyncInterval) {
    // هر ۱۵ ثانیه به سرور می‌گوید من آنلاینم و می‌پرسد آیا او هم هست؟
    soulSyncInterval = setInterval(pingPresence, 15000);
    pingPresence(); // پینگ اولیه
  }
}

function pingPresence() {
  const user = localStorage.getItem("elysium_user");
  fetch(BASE_URL + "/api/presence/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user }),
  })
    .then((r) => r.json())
    .then((data) => {
      const badge = document.getElementById("soul-sync-badge");
      if (data.status === "success" && data.partner_online) {
        document.body.classList.add("soul-sync-active");
        if (badge) badge.classList.remove("hidden-view");
      } else {
        document.body.classList.remove("soul-sync-active");
        if (badge) badge.classList.add("hidden-view");
      }
    })
    .catch((e) => console.log("Soul Sync Pause"));
}

// --- ۲. آینه آسمان (Sky Mirror - Weather) ---
function checkSkyMirrorWeather() {
  fetch(BASE_URL + "/api/weather")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success" && data.is_raining) {
        // ساخت لایه باران در HTML
        const rainDiv = document.createElement("div");
        rainDiv.className = "rain-effect";
        document.body.appendChild(rainDiv);

        // ترکیب صدای باران با آهنگ پس‌زمینه
        const ambient = document.getElementById("ambient-sound");
        if (ambient && ambient.src) {
          // اگر خواستید می‌توانید سورس فایل صوتی را در زمان باران تغییر دهید
          // ambient.src = "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg";
          // ambient.play();
          console.log("آینه آسمان: باران در حال بارش است.");
        }
      }
    });
}

// --- ۳. کپسول زمان دوطرفه (Reverse Time Capsule) ---
// در بخش صندوقچه نامه‌ها (letters.js یا داخل loadLetters)، برای نقش partner هم دکمه «نوشتن نامه به آینده» می‌سازیم.
// برای جلوگیری از شلوغی بیش از حد کد فعلی، دکمه‌ای در بخش صندوقچه برای پارتنر ایجاد می‌کنیم که او را به پنل نوشتن می‌برد.
// این بخش نیازمند آپدیت در index.html (نمایش دکمه نوشتن برای پارتنر) است که در مراحل بعدی می‌توانیم رابط کاربری‌اش را ظریف‌کاری کنیم.

// --- ۴. صورت فلکی اختصاصی (The Constellation Minigame) ---
let constellationStars = [];
let connectedStars = 0;
const TOTAL_STARS = 4; // مثلاً شکل یک لوزی/قلب با ۴ نقطه

function initConstellationMinigame() {
  // فقط در صفحه اصلی اجرا شود
  const homeSection = document.getElementById("section-home");
  if (!homeSection) return;

  // ایجاد یک بوم (Canvas) روی صفحه اصلی برای کشیدن خطوط
  let canvas = document.getElementById("constellation-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "constellation-canvas";
    document.body.appendChild(canvas);

    // همگام‌سازی سایز
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  // قرار دادن ۴ ستاره نامرئی (کمی پرنورتر) در نقاط تصادفی بالای صفحه
  for (let i = 0; i < TOTAL_STARS; i++) {
    const star = document.createElement("div");
    star.className = "constellation-star hidden-view"; // مخفی در ابتدا
    // بعد از لاگین و 10 ثانیه چرخیدن تو سایت نمایان بشن تا سوپرایز بشه
    setTimeout(() => star.classList.remove("hidden-view"), 10000);

    // پخش کردن ستاره‌ها در نیمه بالایی صفحه
    star.style.left = 20 + i * 20 + "%";
    star.style.top = 15 + Math.random() * 20 + "%";
    star.dataset.index = i;

    // (بخش داخل حلقه for در تابع initConstellationMinigame)
    star.onclick = function (e) {
      // 🔴 شاه‌کلید: جلوگیری از انتقال کلیک به پس‌زمینه (تا ستاره جدید ساخته نشود)
      e.stopPropagation();
      handleStarClick(this, canvas);
    };

    document.body.appendChild(star);
    constellationStars.push(star);
  }
}

function handleStarClick(starElement, canvas) {
  if (starElement.classList.contains("connected")) return; // قبلاً کلیک شده

  // ستاره را روشن کن
  starElement.classList.add("connected");

  // ذخیره مختصات ستاره کلیک شده
  const rect = starElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // اگر ستاره اول نیست، از ستاره قبلی به این ستاره خط بکش
  if (connectedStars > 0) {
    const prevStar = constellationStars[connectedStars - 1];
    const prevRect = prevStar.getBoundingClientRect();
    const prevX = prevRect.left + prevRect.width / 2;
    const prevY = prevRect.top + prevRect.height / 2;

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(255, 215, 0, 0.6)"; // خط نوری طلایی
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffd700";
    ctx.stroke();
  }

  // جابه‌جایی جایگاه این ستاره در آرایه تا ترتیب کشیدن خطوط درست شود
  const currentIndex = parseInt(starElement.dataset.index);
  const temp = constellationStars[connectedStars];
  constellationStars[connectedStars] = starElement;
  constellationStars[currentIndex] = temp;
  // آپدیت ایندکس‌ها
  constellationStars[connectedStars].dataset.index = connectedStars;
  constellationStars[currentIndex].dataset.index = currentIndex;

  connectedStars++;

  // اگر همه ستاره‌ها وصل شدند!
  if (connectedStars === TOTAL_STARS) {
    // کشیدن خط از ستاره آخر به ستاره اول برای بستن شکل
    const firstStar = constellationStars[0];
    const fRect = firstStar.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(fRect.left + fRect.width / 2, fRect.top + fRect.height / 2);
    ctx.stroke();

    setTimeout(() => {
      constellationReward();
    }, 1000);
  }
}

function constellationReward() {
  // پخش صدای جادویی (متصل به سیستم قطع سراسری)
  try {
    if (window.magicAudio) {
      window.magicAudio.pause();
      window.magicAudio.currentTime = 0;
    }
    window.magicAudio = new Audio(BASE_URL + "/magic.mp3");
    window.magicAudio.volume = 0.5;
    window.magicAudio.play().catch((e) => {});
  } catch (e) {}

  const rewardHtml = `
        <div style="text-align: center; padding: 20px 0;">
            <i class="fa-solid fa-star-and-crescent" style="font-size: 4rem; color: #ffd700; filter: drop-shadow(0 0 20px rgba(255,215,0,0.8)); margin-bottom: 20px; animation: goldPulse 2s infinite alternate;"></i>
            <h3 style="color: #ffd700; margin-bottom: 15px;">صورت فلکیِ ما 🌌</h3>
            <p style="color: var(--text-main); line-height: 1.8; font-size: 1.05rem;">
                تو نقطه نقطه‌ی ستاره‌ها رو پیدا کردی و اونا رو به هم وصل کردی.<br>
                همون‌طور که توی این دنیای بزرگ، ما همدیگه رو پیدا کردیم و زندگیمون به هم وصل شد. 💛<br>
                <br>
                <i>"در میان میلیاردها ستاره، تو تنها صورت فلکیِ قلب منی."</i>
            </p>
            <button class="btn-gradient" style="margin-top: 25px; background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; font-weight: bold;" onclick="closeDetail()">دوستت دارم ✨</button>
        </div>
    `;
  openModal("یک راز در آسمان...", rewardHtml);

  // پاک کردن بوم بعد از اتمام
  setTimeout(() => {
    const canvas = document.getElementById("constellation-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    document
      .querySelectorAll(".constellation-star")
      .forEach((s) => s.classList.remove("connected"));
    connectedStars = 0;
  }, 10000);
}

// ================= فاز ۸.۲: کپسول زمان دوطرفه (با تمام افکت‌های جادویی) =================

function openPartnerStudio() {
  const studioHtml = `
        <div style="text-align: right; padding: 10px; position: relative;" id="partner-studio-container">
            <div class="input-group">
                <input type="text" id="partner-letter-title" class="glow-input" placeholder="یک عنوان برای نامه‌ات انتخاب کن..." style="width: 100%; border: 1px solid var(--border-light);">
            </div>
            <div class="input-group" style="margin-top: 15px;">
                <textarea id="partner-letter-content" class="modern-textarea" placeholder="حرف‌های دلت رو اینجا بنویس... (هنگام تایپ کردن به صفحه دقت کن ✨)" style="min-height: 220px; padding: 15px; width: 100%; border: 1px solid var(--border-light);"></textarea>
            </div>
            
            <div style="margin-top: 20px; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border: 1px dashed var(--orange-main);">
                <label style="color: var(--orange-main); font-size: 0.95rem; font-weight: bold;"><i class="fa-solid fa-lock"></i> کپسول زمان (اختیاری):</label>
                <input type="datetime-local" id="partner-letter-unlock" class="glow-input" style="margin-top: 10px; width: 100%;">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px; line-height: 1.6;">
                    اگر اینجا تاریخی رو مشخص کنی، نامه‌ی تو قفل می‌شه و متین به هیچ‌وجه نمی‌تونه تا قبل از رسیدن اون زمان نامه‌ات رو بخونه!
                </p>
            </div>
            
            <button id="btn-partner-send" class="btn-gradient" style="margin-top: 25px; width: 100%; position: relative; z-index: 10;" onclick="submitPartnerLetter()">
                <i class="fa-solid fa-paper-plane"></i> ارسال نامه برای متین 💌
            </button>
        </div>
    `;
  openModal("استودیو نویسندگیِ تو ✍️", studioHtml);

  // ====== 🔴 افکت اول: باران قلب و ستاره حین تایپ کردن ======
  const textarea = document.getElementById("partner-letter-content");
  const container = document.getElementById("partner-studio-container");

  if (textarea && container) {
    textarea.addEventListener("input", function (e) {
      // فقط روی ۳۰٪ از ضربات کلید افکت می‌سازیم تا مرورگر هنگ نکند
      if (Math.random() > 0.3) return;

      const particle = document.createElement("i");
      const icons = ["fa-heart", "fa-heart", "fa-star"];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const colors = ["#ff4d4d", "#ff69b4", "#ffd700"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      particle.className = `fa-solid ${randomIcon}`;
      particle.style.position = "absolute";
      particle.style.color = randomColor;
      particle.style.fontSize = Math.random() * 1 + 0.8 + "rem";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "5";
      particle.style.filter = `drop-shadow(0 0 8px ${randomColor})`;

      // مکان رندوم تولید قلب (داخل محدوده نوشتن)
      particle.style.left = Math.random() * 80 + 10 + "%";
      particle.style.top = Math.random() * 30 + 30 + "%";

      container.appendChild(particle);

      // انیمیشن صعود به بالا و محو شدن
      particle.animate(
        [
          { transform: "translateY(0) scale(0.5) rotate(0deg)", opacity: 1 },
          {
            transform: `translateY(-120px) scale(1.5) rotate(${Math.random() * 60 - 30}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1500 + Math.random() * 1000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "forwards",
        },
      );

      // حذف از حافظه مرورگر بعد از انیمیشن
      setTimeout(() => particle.remove(), 2500);
    });
  }
}

// ====== 🔴 افکت دوم: انفجار جادویی موقع زدن دکمه ارسال ======
function submitPartnerLetter() {
  const title = document.getElementById("partner-letter-title").value;
  const content = document.getElementById("partner-letter-content").value;
  const unlock = document.getElementById("partner-letter-unlock").value;
  const btn = document.getElementById("btn-partner-send");

  if (!title || !content)
    return alert("لطفاً هم عنوان و هم متن نامه رو بنویس عزیزم.");

  // تنظیمات ساخت انفجار از مرکز دکمه ارسال
  const rect = btn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement("i");
    const icons = ["fa-heart", "fa-star", "fa-paper-plane"];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const colors = ["#ff4d4d", "#ff69b4", "#ffd700", "#ffffff"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    particle.className = `fa-solid ${randomIcon}`;
    particle.style.position = "fixed";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.color = randomColor;
    particle.style.fontSize = Math.random() * 1.5 + 0.8 + "rem";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "99999";
    particle.style.filter = `drop-shadow(0 0 10px ${randomColor})`;

    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 80 + Math.random() * 150;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - 100;

    particle.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)",
          opacity: 1,
        },
        {
          transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.5) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 1000 + Math.random() * 800,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        fill: "forwards",
      },
    );

    setTimeout(() => particle.remove(), 2000);
  }

  // پخش افکت صوتی ارسال (متصل به سیستم قطع سراسری)
  try {
    if (window.magicAudio) {
      window.magicAudio.pause();
      window.magicAudio.currentTime = 0;
    }
    window.magicAudio = new Audio(BASE_URL + "/magic.mp3");
    window.magicAudio.volume = 0.6;
    window.magicAudio.play().catch((e) => {});
  } catch (e) {}

  // ارسال واقعی به سرور
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> در حال رها کردن در فضا...';
  btn.style.pointerEvents = "none";

  fetch(BASE_URL + "/api/partner_letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title,
      content: content,
      unlock_date: unlock,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> با موفقیت ارسال شد';
        btn.style.background = "var(--green-main)";
        setTimeout(() => {
          closeDetail();
          loadLetters();
        }, 2000);
      } else {
        alert("❌ خطا: " + data.message);
        btn.innerHTML = "ارسال مجدد";
        btn.style.pointerEvents = "auto";
      }
    })
    .catch((e) => {
      alert("❌ خطا در برقراری ارتباط با شبکه");
      btn.innerHTML = "ارسال مجدد";
      btn.style.pointerEvents = "auto";
    });
}

// ================= فاز ۹: افکت‌های پیشرفته صفحه لاگین سه‌بعدی =================

// ۱. سنسور زنده تشخیص هویت هنگام تایپ نام کاربری
function detectUserPersona(val) {
  const badge = document.getElementById("user-persona-badge");
  const text = document.getElementById("persona-text");
  if (!badge || !text) return;

  const cleanVal = val.trim().toLowerCase();

  if (cleanVal.includes("moti") || cleanVal.includes("مطهره")) {
    text.innerText = "خوش آمدی مطهره جان 🌸";
    badge.style.borderColor = "#ff69b4";
    badge.style.boxShadow = "0 0 20px rgba(255, 105, 180, 0.4)";
    badge.classList.remove("hidden-persona");
    badge.classList.add("show-persona");
  } else if (cleanVal.includes("matin") || cleanVal.includes("متین")) {
    text.innerText = "خوش آمدی ادمین متین ⚡";
    badge.style.borderColor = "var(--orange-main)";
    badge.style.boxShadow = "0 0 20px var(--orange-glow)";
    badge.classList.remove("hidden-persona");
    badge.classList.add("show-persona");
  } else {
    badge.classList.remove("show-persona");
    badge.classList.add("hidden-persona");
  }
}

// ۲. قابلیت دیدن / مخفی کردن رمز عبور
function togglePasswordVisibility() {
  const passInput = document.getElementById("password");
  const eyeIcon = document.getElementById("pass-eye-icon");
  if (!passInput || !eyeIcon) return;

  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.className = "fa-regular fa-eye-slash";
    eyeIcon.style.color = "var(--orange-main)";
  } else {
    passInput.type = "password";
    eyeIcon.className = "fa-regular fa-eye";
    eyeIcon.style.color = "var(--text-muted)";
  }
}

// ۳. افکت چرخش سه‌بعدی (هوشمند شده برای دسکتاپ و موبایل)
document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("login-card-3d");
  const container = document.getElementById("login-page");

  if (card && container) {
    container.addEventListener("mousemove", (e) => {
      // 🔴 شاه‌کلید حل لگ: اگر کاربر در موبایل است یا صفحه لمسی دارد، افکت سه‌بعدی را غیرفعال کن
      if (window.innerWidth <= 768 || "ontouchstart" in window) {
        card.style.transform = "rotateX(0deg) rotateY(0deg)";
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // محاسبه زوایای چرخش
      const rotateX = (-y / rect.height) * 18;
      const rotateY = (x / rect.width) * 18;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    container.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }
});

// ۴. رفع باگ از کار افتادن ستاره‌ها در حالت دسکتاپ موبایل (Desktop Site)
window.addEventListener("resize", () => {
  const canvas = document.querySelector("#particles-js canvas");
  if (canvas) {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
  }
});

// ================= فاز ۱۱: موتور سینماتیک موزه یادگاری‌ها =================
function openShrineItem(type) {
  let title = "";
  let text = "";
  let iconHtml = "";
  let themeColor = "#ffd700"; // رنگ اصلی نوشته‌ها و دکمه (روشن و خوانا)

  if (type === "hairtie") {
    title = "کش موی مقدس";
    // کش مو مشکی با هاله نوری نقره‌ای شبیه خورشیدگرفتگی
    iconHtml = `<i class="fa-solid fa-ring" style="font-size: 5.5rem; color: #1a1a1a; filter: drop-shadow(0 0 25px rgba(226,232,240,0.9)) drop-shadow(0 0 5px #fff); animation: floatPortal 4s infinite alternate;"></i>`;
    themeColor = "#e2e8f0"; // رنگ متن‌ها نقره‌ای/سفید خوانا
    text =
      "این کش مو را یادت هست؟\nبه عطر موهایت آغشته‌اش کردی تا وقتی فرسنگ‌ها دوری، با بوییدنش چشم‌هایم را ببندم و تو را در آغوشم حس کنم.\nاینجا امن‌ترین گاوصندوق دنیاست برای حفظ عطر تو...";
  } else if (type === "kiss") {
    title = "بوسه کاغذی";
    // استفاده از ایموجی 💋
    iconHtml = `<span style="font-size: 6.5rem; font-style: normal; filter: drop-shadow(0 0 30px rgba(255,77,77,0.9)); animation: floatPortal 4s infinite alternate;">💋</span>`;
    themeColor = "#ff4d4d";
    text =
      "بوسه‌هایی که روی کاغذ کاشتی...\nهر شب قبل از خواب نگاهشان می‌کنم. این کاغذِ معمولی نیست، این سند مالکیت قلب من است که با لب‌های تو مهر و موم شده.";
  } else if (type === "watch") {
    title = "ساعت زمان";
    iconHtml = `<i class="fa-solid fa-stopwatch" style="font-size: 5.5rem; color: #ffd700; filter: drop-shadow(0 0 30px rgba(255,215,0,0.9)); animation: floatPortal 4s infinite alternate;"></i>`;
    themeColor = "#ffd700";
    text =
      "ساعتی که برایم گرفتی...\nفقط زمان را نشان نمی‌دهد، بلکه ثانیه‌های مانده تا دیدار دوباره‌مان را می‌شمارد. هر تیک‌تاکش صدای تپش قلب من برای توست.";
  } else if (type === "sneakers") {
    title = "کتونی سفید تولد";
    iconHtml = `<i class="fa-solid fa-shoe-prints" style="font-size: 5.5rem; color: #ffffff; filter: drop-shadow(0 0 30px rgba(255,255,255,0.9)); animation: floatPortal 4s infinite alternate;"></i>`;
    themeColor = "#ffffff";
    text =
      "کتونی سفیدی که برای روز تولدم هدیه گرفتی...\nاین فقط یک جفت کفش نیست، نمادِ هم‌قدم شدن با تو در مسیر زندگی است. هر قدمی که با این کتونی برمی‌دارم، به من یادآوری می‌کند که تو زیباترین هم‌سفرِ تمامِ راه‌های نرفته‌ی من هستی.";
  }

  // ساخت لایه‌ی تمام‌صفحه و سینماتیک
  const overlay = document.createElement("div");
  overlay.id = "shrine-cinematic-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.96)";
  overlay.style.zIndex = "10000";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.color = "var(--text-main)";

  // تولید افکت مِه (Smoke)
  const smokeContainer = document.createElement("div");
  smokeContainer.className = "smoke-container";
  for (let i = 0; i < 6; i++) {
    const smoke = document.createElement("div");
    smoke.className = "smoke-particle";
    smoke.style.left = Math.random() * 80 + 10 + "%";
    smoke.style.animationDelay = i * 1.8 + "s";
    smokeContainer.appendChild(smoke);
  }

  const contentBox = document.createElement("div");
  contentBox.style.zIndex = "10001";
  contentBox.style.textAlign = "center";
  contentBox.style.maxWidth = "700px";
  contentBox.style.padding = "40px";

  // 🔴 دکمه بازگشت با دستور مستقیم و ضدخطا بازنویسی شد
  contentBox.innerHTML = `
        ${iconHtml}
        <h2 style="color: ${themeColor}; margin-top: 30px; margin-bottom: 25px; font-size: 2.2rem; letter-spacing: 2px; text-shadow: 0 0 15px ${themeColor};">${title}</h2>
        <div id="shrine-typewriter" style="font-size: 1.35rem; line-height: 2.2; min-height: 180px; text-align: justify; text-align-last: center; color: #f8fafc; text-shadow: 0 0 10px rgba(255,255,255,0.4);"></div>
        <button class="btn-outline" style="margin-top: 45px; border: 2px solid ${themeColor}; color: ${themeColor}; background: rgba(0,0,0,0.5); width: auto; padding: 12px 35px; font-size: 1.15rem; font-weight: bold; border-radius: 12px; box-shadow: 0 0 20px ${themeColor}40; cursor: pointer;" onclick="const ov = document.getElementById('shrine-cinematic-overlay'); if(ov) ov.remove(); if(window.shrineAudio) window.shrineAudio.pause();">بازگشت به دنیای واقعی</button>
    `;

  overlay.appendChild(smokeContainer);
  overlay.appendChild(contentBox);
  document.body.appendChild(overlay);

  // پخش افکت صوتی اتمسفریک (متصل به حافظه window)
  try {
    if (window.shrineAudio) window.shrineAudio.pause(); // قطع صدای قبلی اگر در حال پخش بود
    window.shrineAudio = new Audio(BASE_URL + "/shrine.mp3");
    window.shrineAudio.volume = 0.5;

    window.shrineAudio.play().catch((e) => {});

    // فید اوت (کم شدن تدریجی صدا) بعد از ۸ ثانیه
    setTimeout(() => {
      let fadeOut = setInterval(() => {
        if (window.shrineAudio && window.shrineAudio.volume > 0.05) {
          window.shrineAudio.volume -= 0.05;
        } else {
          clearInterval(fadeOut);
          if (window.shrineAudio) window.shrineAudio.pause();
        }
      }, 200);
    }, 8000);
  } catch (e) {}

  // افکت تایپ‌رایتر
  const twElement = document.getElementById("shrine-typewriter");
  let charIndex = 0;
  const textToType = text.replace(/\\n/g, "<br><br>");
  twElement.innerHTML = "";
  let isTag = false;
  let tagBuffer = "";

  function typeWriter() {
    if (charIndex < textToType.length) {
      let char = textToType.charAt(charIndex);
      if (char === "<") isTag = true;
      if (isTag) {
        tagBuffer += char;
        if (char === ">") {
          isTag = false;
          twElement.innerHTML += tagBuffer;
          tagBuffer = "";
        }
      } else {
        twElement.innerHTML += char;
      }
      charIndex++;
      setTimeout(typeWriter, isTag ? 0 : 50);
    }
  }
  setTimeout(typeWriter, 1200);
}

// ================= سیستم هوشمند قطع صدای پاپ‌آپ‌ها و لایه‌ها =================
/*document.addEventListener("click", function (e) {
  // ۱. اگر کاربر پاپ‌آپ را با ضربدر یا کلیک روی فضای تاریک بست
  if (
    e.target.closest(".close-modal-btn") ||
    e.target.closest(".close-book-btn") ||
    e.target.id === "overlay-backdrop"
  ) {
    if (window.magicAudio) {
      window.magicAudio.pause();
      window.magicAudio.currentTime = 0; // برگرداندن صدا به ابتدا
    }
  }
});

// تابع اختصاصی برای بستن موزه و قطع صدای اتمسفر
function closeShrineOverlay() {
  const overlay = document.getElementById("shrine-cinematic-overlay");
  if (overlay) overlay.remove();

  // قطع کردن صدای رازآلود موزه
  if (window.shrineAudio) {
    window.shrineAudio.pause();
    window.shrineAudio.currentTime = 0;
  }
}*/
