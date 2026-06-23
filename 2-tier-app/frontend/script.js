const API_BASE = "http://localhost:8001";
const statusDot = document.querySelector(".status-dot");
const statusText = document.getElementById("status-text");
const apiDataContainer = document.getElementById("api-data");

async function checkHealth() {
  statusDot.style.background = "#ffd700";
  statusText.textContent = "Checking...";

  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();

    if (data.status === "OK") {
      statusDot.style.background = "#48bb78";
      statusText.textContent = "Backend Connected";
      apiDataContainer.innerHTML = `<div class="success-msg">
                    <strong>Health Check Passed</strong><br>
                    ${data.message}<br>
                    <small>${data.timestamp}</small>
                </div>`;
    } else {
      throw new Error("Unexpected response");
    }
  } catch (err) {
    statusDot.style.background = "#f56565";
    statusText.textContent = "Backend Unreachable";
    apiDataContainer.innerHTML = `<div class="error-msg">
                <strong>Health Check Failed</strong><br>
                Could not reach backend at ${API_BASE}/api/health<br>
                <small>${err.message}</small>
            </div>`;
  }
}

async function fetchData() {
  apiDataContainer.innerHTML = `<div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading data from backend...
        </div>`;

  try {
    const res = await fetch(`${API_BASE}/api/data`);
    const data = await res.json();

    let featuresList = data.features.map((f) => `<li>${f}</li>`).join("");

    apiDataContainer.innerHTML = `
            <div class="success-msg">
                <strong>${data.message}</strong><br>
                ${data.description}
            </div>
            <ul style="margin-top: 12px; padding-left: 20px;">${featuresList}</ul>
            <small style="color:#888; display:block; margin-top: 10px;">
                Last updated: ${data.timestamp}
            </small>
        `;
  } catch (err) {
    apiDataContainer.innerHTML = `<div class="error-msg">
                <strong>Failed to fetch data</strong><br>
                ${err.message}
            </div>`;
  }
}

// Initial load
checkHealth();
setTimeout(fetchData, 1000);
