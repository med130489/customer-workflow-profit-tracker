// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.appspot.com",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Toast Function
function showToast(message, success = true) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${success ? "bg-green-600" : "bg-red-600"} text-white`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// Login
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      showToast("Login successful!");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    })
    .catch((error) => {
      showToast(error.message, false);
    });
};

// Signup
window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      showToast("Signup successful! Please login.");
    })
    .catch((error) => {
      showToast(error.message, false);
    });
};

// Logout
window.logout = function () {
  signOut(auth).then(() => {
    showToast("Logged out");
    localStorage.removeItem("profitData");
    window.location.href = "index.html";
  });
};

// Profit Module (Only works on dashboard.html)
document.addEventListener("DOMContentLoaded", () => {
  const user = auth.currentUser;
  onAuthStateChanged(auth, (user) => {
    if (!user && window.location.pathname.includes("dashboard.html")) {
      window.location.href = "index.html";
    }
  });

  const profitForm = document.getElementById("profit-form");
  const profitBody = document.getElementById("profitBody");
  const profitChartCanvas = document.getElementById("profitChart");
  let chart;

  let profitData = JSON.parse(localStorage.getItem("profitData")) || [];

  function saveData() {
    localStorage.setItem("profitData", JSON.stringify(profitData));
  }

  function calculateProfit(item) {
    const profit = item.charge - item.actualCost;
    const margin = item.charge ? ((profit / item.charge) * 100).toFixed(2) : 0;
    return { profit, margin };
  }

  function renderTable() {
    if (!profitBody) return;
    profitBody.innerHTML = "";
    profitData.forEach((item, index) => {
      profitBody.innerHTML += `
        <tr class="border-b">
          <td class="p-2">${item.jobNo}</td>
          <td class="p-2">${item.customer}</td>
          <td class="p-2">${item.shipment}</td>
          <td class="p-2">${item.charge}</td>
          <td class="p-2">${item.actualCost}</td>
          <td class="p-2">${item.profit}</td>
          <td class="p-2">${item.margin}%</td>
          <td class="p-2">${item.status}</td>
        </tr>`;
    });
  }

  function renderChart() {
    if (!profitChartCanvas) return;
    const ctx = profitChartCanvas.getContext("2d");
    const labels = profitData.map(item => item.customer + " (" + item.jobNo + ")");
    const profits = profitData.map(item => item.profit);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Profit",
          data: profits,
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1
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

  if (profitForm) {
    profitForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const form = new FormData(profitForm);
      const item = {
        jobNo: form.get("jobNo"),
        customer: form.get("customer"),
        shipment: form.get("shipment"),
        charge: parseFloat(form.get("charge")),
        actualCost: parseFloat(form.get("actualCost")),
        status: form.get("status")
      };

      const { profit, margin } = calculateProfit(item);
      item.profit = profit;
      item.margin = margin;

      profitData.push(item);
      saveData();
      renderTable();
      renderChart();
      showToast("Record added successfully!");
      profitForm.reset();
    });
  }

  window.exportToExcel = function () {
    if (!profitData.length) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(profitData);
    XLSX.utils.book_append_sheet(wb, ws, "Profits");
    XLSX.writeFile(wb, "profit-data.xlsx");
  };

  renderTable();
  renderChart();
});
