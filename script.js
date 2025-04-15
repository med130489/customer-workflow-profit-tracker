import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.appspot.com",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b",
  measurementId: "G-KJDNWXT8EC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Signed up!"))
    .catch((err) => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  signInWithEmailAndPassword(auth, email, password)
    .catch((err) => alert(err.message));
}

function logout() {
  signOut(auth).then(() => alert("Logged out"));
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    document.getElementById("userEmail").textContent = user.email;
    renderTable();
    renderChart();
  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
  }
});

window.signup = signup;
window.login = login;
window.logout = logout;

let profitData = JSON.parse(localStorage.getItem("profitData")) || [];

document.getElementById("profitForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const jobNo = document.getElementById("jobNo").value.trim();
  const customer = document.getElementById("customer").value.trim();
  const shipment = document.getElementById("shipment").value.trim();
  const charge = parseFloat(document.getElementById("charge").value);
  const cost = parseFloat(document.getElementById("actualCost").value);
  const status = document.getElementById("status").value;

  const profit = charge - cost;
  const margin = ((profit / charge) * 100).toFixed(2) + "%";

  const entry = { jobNo, customer, shipment, charge, actualCost: cost, profit, margin, status };
  profitData.push(entry);
  localStorage.setItem("profitData", JSON.stringify(profitData));
  this.reset();
  renderTable();
  renderChart();
});

function renderTable() {
  const body = document.getElementById("profitBody");
  body.innerHTML = "";
  profitData.forEach((item) => {
    body.innerHTML += `
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
  const ctx = document.getElementById("profitChart").getContext("2d");
  const customers = {};
  profitData.forEach((item) => {
    if (!customers[item.customer]) customers[item.customer] = 0;
    customers[item.customer] += item.profit;
  });

  const labels = Object.keys(customers);
  const profits = Object.values(customers);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Profit by Customer",
        data: profits,
        backgroundColor: "#007bff"
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
