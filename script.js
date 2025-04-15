import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { utils, writeFile } from "https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs";

const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.appspot.com",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard-section");
const toast = document.getElementById("toast");
const profitBody = document.getElementById("profitBody");

let userData = [];
let currentUser = null;
let currentSortField = "";

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user.uid;
    authSection.style.display = "none";
    dashboard.style.display = "block";
    loadData();
  } else {
    authSection.style.display = "block";
    dashboard.style.display = "none";
  }
});

window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast("Signup successful!");
  } catch (error) {
    showToast(error.message);
  }
};

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login successful!");
  } catch (error) {
    showToast(error.message);
  }
};

window.logout = async function () {
  await signOut(auth);
  showToast("Logged out.");
};

function showToast(message) {
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

window.toggleDarkMode = function () {
  document.body.classList.toggle("dark-mode");
};

function loadData() {
  const stored = localStorage.getItem(`profitData_${currentUser}`);
  userData = stored ? JSON.parse(stored) : sampleData;
  renderTable(userData);
  renderChart(userData);
}

function saveData() {
  localStorage.setItem(`profitData_${currentUser}`, JSON.stringify(userData));
}

function renderTable(data) {
  profitBody.innerHTML = "";
  data.forEach((item, index) => {
    profitBody.innerHTML += `
      <tr>
        <td>${item.jobNo}</td>
        <td>${item.customer}</td>
        <td>${item.shipment}</td>
        <td>${item.charge}</td>
        <td>${item.actualCost}</td>
        <td>${item.profit}</td>
        <td>${item.margin}</td>
        <td>${item.status}</td>
        <td>
          <button onclick="editRecord(${index})">Edit</button>
          <button onclick="deleteRecord(${index})">Delete</button>
        </td>
      </tr>`;
  });
}

function renderChart(data) {
  const ctx = document.getElementById("profitChart").getContext("2d");
  const labels = data.map(i => `${i.customer} (${i.jobNo})`);
  const profits = data.map(i => i.profit);

  if (window.profitChart) window.profitChart.destroy();

  window.profitChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Profit",
        data: profits,
        backgroundColor: "#4f46e5"
      }]
    }
  });
}

window.deleteRecord = function (index) {
  userData.splice(index, 1);
  saveData();
  loadData();
  showToast("Record deleted");
};

window.editRecord = function (index) {
  const record = userData[index];
  const updated = prompt("Edit profit", record.profit);
  if (updated !== null) {
    userData[index].profit = parseFloat(updated);
    saveData();
    loadData();
    showToast("Record updated");
  }
};

window.exportToExcel = function () {
  const ws = utils.json_to_sheet(userData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Profits");
  writeFile(wb, "profit_report.xlsx");
  showToast("Exported to Excel");
};

window.sortTable = function (field) {
  currentSortField = field;
  userData.sort((a, b) => {
    const x = a[field];
    const y = b[field];
    return typeof x === "number" ? y - x : ("" + x).localeCompare("" + y);
  });
  loadData();
};

window.applyFilters = function () {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = userData.filter(i =>
    i.customer.toLowerCase().includes(query) || i.jobNo.toLowerCase().includes(query)
  );
  renderTable(filtered);
  renderChart(filtered);
};

const sampleData = [
  { jobNo: "J001", customer: "Alpha", shipment: "Air", charge: 5000, actualCost: 3000, profit: 2000, margin: "40%", status: "Completed" },
  { jobNo: "J002", customer: "Beta", shipment: "Sea", charge: 8000, actualCost: 5000, profit: 3000, margin: "37.5%", status: "In Progress" }
];
