const apiKey = "7ea1ccbf295b426daa079e79149ad7da";
const calendarDiv = document.getElementById("calendar");
const beforeBtn = document.getElementById("before");
const nextBtn = document.getElementById("next");

let currentDate = new Date();

const phaseImages = {
  "New Moon": "newMoon.png",
  "Waxing Crescent": "img/waxingCrescent.png",
  "First Quarter": "img/firstQuarter.png",
  "Waxing Gibbous" :"img/waxingGibbous.png",
  "Full Moon" : "img/fullMoon.jpg",
  "Waning Gibbous": "img/waningGibbous.png",
  "Last Quarter" : "img/lastQuarter.png",
  "Waning Crescent": "img/waningCrescent.png"
};

function showDay(date) {
  const dateString = date.toISOString().split("T")[0];
  calendarDiv.innerHTML = "<p>Loading...</p>";

  const cached = localStorage.getItem(`moon_${dateString}`);
  if (cached) {
    const data = JSON.parse(cached);
    renderDay(dateString, data.moon_phase, data.moon_illumination_percentage);
  } else {
    fetch(`https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&date=${dateString}`)
      .then(response => response.json())
      .then(data => {
        localStorage.setItem(`moon_${dateString}`, JSON.stringify(data));
        renderDay(dateString, data.moon_phase, data.moon_illumination_percentage);
      })
      .catch(() => {
        calendarDiv.innerHTML = "<p>Error loading moon data.</p>";
      });
  }
}

function renderDay(dateString, phase, illumination) {
  const formattedPhase = formatPhase(phase);
  const illuminationText = illumination
    ? `${illumination}% illuminated`
    : `Illumination not available`;
// Disply the moon phase image if available
const imgSrc = phaseImages[formattedPhase]
  calendarDiv.innerHTML = `
    <div class="day">
      <strong>${dateString}</strong><br>
      <img src="${imgSrc}" alt="${formattedPhase}" style="width:100px;height:100px;"><br>
      ${formattedPhase}<br>
      🌙 ${illuminationText}
    </div>
  `;
}

function formatPhase(phase) {
  return phase
    ? phase.toLowerCase().split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : "";
}

// Button event listeners
beforeBtn.onclick = () => {
  currentDate.setDate(currentDate.getDate() - 1);
  showDay(currentDate);
};
nextBtn.onclick = () => {
  currentDate.setDate(currentDate.getDate() + 1);
  showDay(currentDate);
};

// Initial display
showDay(currentDate);
