const apiKey = "7ea1ccbf295b426daa079e79149ad7da"; //API key for the Moon Phase API
const calendarDiv = document.getElementById("calendar");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

const daysInMonth = new Date(year, month + 1, 0).getDate();

const menuButton = document.getElementById("menu-Button");
const popupMenu = document.getElementById("popup-Menu");
const closeMenu = document.getElementById("close-Menu");

menuButton.onclick = () => {
  popupMenu.style.display = "flex";
};

closeMenu.onclick = () => {
  popupMenu.style.display = "none";
};

const fetchPromises = [];

 for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(year, month, day);
  const dateString = date.toISOString().split("T")[0];

  const cached = localStorage.getItem(`moon_${dateString}`);

  if (cached) {
    const data = JSON.parse(cached);
    fetchPromises.push(Promise.resolve({
      date: dateString,
      phase: data.moon_phase,
      illumination: data.moon_illumination_percentage || null
    }));
  } else {
    const fetchPromise = fetch(`https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&date=${dateString}`)
      .then(response => response.json())
      .then(data => {
        localStorage.setItem(`moon_${dateString}`, JSON.stringify(data));
        return {
          date: dateString,
          phase: data.moon_phase,
          illumination: data.moon_illumination_percentage || null
        };
      });

    fetchPromises.push(fetchPromise);
  }
}
// 👉 Once all data is ready, sort and display
Promise.all(fetchPromises)
  .then(results => {
    results.sort((a, b) => new Date(a.date) - new Date(b.date));

    results.forEach(entry => {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const formattedPhase = formatPhase(entry.phase);
      const illuminationText = entry.illumination
        ? `${entry.illumination}% illuminated`
        : `Illumination not available`;

      dayDiv.innerHTML = `
        <strong>${entry.date}</strong><br>
        ${formattedPhase}<br>
        🌙 ${illuminationText}
      `;

      calendarDiv.appendChild(dayDiv);
    });
  })
  .catch(error => {
    console.error("Error loading moon data:", error);
    calendarDiv.innerHTML = `<p>Error loading moon phase data.</p>`;
  });

// 👉 Helper to format phase names
function formatPhase(phase) {
  return phase
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
