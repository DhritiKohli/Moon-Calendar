const apiKey = "7ea1ccbf295b426daa079e79149ad7da"; //API key for the Moon Phase API
const calendarDiv = document.getElementById("calendar");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

const daysInMonth = new Date(year, month + 1, 0).getDate();

const fetchPromises = [];

// Step 1: Collect all fetch promises for each day of the month
for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(year, month, day);
  const dateString = date.toISOString().split("T")[0];

  const fetchPromise = fetch(`https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&date=${dateString}`)
    .then(response => response.json())
    .then(data => {
      console.log("Fetched for", dateString, data); // For debugging
      return {
        date: dateString,
        phase: data.moon_phase,
        illumination: data.moon_illumination_percentage || null
      };
    });

  fetchPromises.push(fetchPromise);
}

// Step 2: Wait for all API responses and display them
Promise.all(fetchPromises)
  .then(results => {
    results.sort((a, b) => new Date(a.date) - new Date(b.date));

    results.forEach(entry => {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const formattedPhase = formatPhase(entry.phase);
      const illuminationText = entry.illumination
        ? `${entry.illumination}% illuminated`
        : `🌙 Illumination not available`;

      dayDiv.innerHTML = `
        <strong>${entry.date}</strong><br>
        ${formattedPhase}<br>
        🌙 ${illuminationText}
      `;

      calendarDiv.appendChild(dayDiv);
    });
  })
  .catch(error => {
    console.error("Failed to fetch moon data:", error);
    calendarDiv.innerHTML = `<p>Error loading moon phase data.</p>`;
  });

// Helper function to make "WAXING_CRESCENT" → "Waxing Crescent"
function formatPhase(phase) {
  return phase
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}