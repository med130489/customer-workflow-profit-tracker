let profitData = JSON.parse(localStorage.getItem("profitData")) || [];

const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const toast = document.getElementById("toast");

// Fake auth for now
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  if (email && password) {
    localStorage.setItem("loggedIn", "true");
    showDashboard();
    showToast("Logged in successfully!");
  } else {
    showToast("Please enter email and password", false);
  }
}

function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  if (email && password) {
    showToast("Signed up successfully! You can now log in.");
  } else {
    showToast("Please enter email and password", false);
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

function showDashboard() {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  renderTable();
  renderChart();
}

if (localStorage.getItem("loggedIn") === "true") {
  showDashboard();
}

function showToast(msg, success = true) {
  toast.textContent = msg;
  toast.style.backgroundColor = success ? "green" : "red";
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function calculateProfit(item) {
  const profit = item.charge - item.actualCost;
  const margin = item.charge ? ((profit / item.charge) * 100).toFixed(2) : 0;
  return { profit, margin };
}

document.getElementById("profit-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const item = {
    jobNo: document.getElementById("jobNo").value,
    customer: document.getElementById("customer").value,
    shipment: document.getElementById("shipment").value,
    charge: parseFloat(document.getElementById("charge").value),
    actualCost: parseFloat(document.getElementById("actualCost").value),
    status: document.getElementById("status").value,
  };

  const { profit, margin } = calculateProfit(item);
  item.profit = profit;
  item.margin = margin;

  profitData.push(item);
  localStorage.setItem("profitData", JSON.stringify(profitData));
  renderTable();
  renderChart();
  showToast("Record added!");
  this.reset();
});

function renderTable() {
  const tbody = document.getElementById("profitBody");
  tbody.innerHTML = "";
  profitData.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.jobNo}</td>
        <td>${item.customer}</td>
        <td>${item.shipment}</td>
        <td>${item.charge}</td>
        <td>${item.actualCost}</td>
        <td>${item.profit}</td>
        <td>${item.margin}</td>
        <td>${item.status}</td>
      </tr>
    `;
  });
}

let chart;
function renderChart() {
  if (chart) chart.destroy();
  const ctx = document.getElementById("profitChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: profitData.map(item => item.customer),
      datasets: [{
        label: "Profit",
        data: profitData.map(item => item.profit),
        backgroundColor: "#3b82f6"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function exportToExcel() {
  // You can integrate SheetJS here if needed later
  alert("Excel export coming soon!");
}
