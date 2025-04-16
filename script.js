
let profitData = JSON.parse(localStorage.getItem("profitData")) || [];
const profitForm = document.getElementById("profit-form");
const profitBody = document.getElementById("profitBody");
const profitChart = document.getElementById("profitChart").getContext("2d");
const toast = document.getElementById("toast");

function showToast(message, success = true) {
  toast.textContent = message;
  toast.className = \`toast fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg z-50 \${success ? "bg-green-600" : "bg-red-600"} text-white\`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function saveData() {
  localStorage.setItem("profitData", JSON.stringify(profitData));
}

function calculateProfit(item) {
  const profit = item.charge - item.actualCost;
  const margin = item.charge ? ((profit / item.charge) * 100).toFixed(2) : 0;
  return { profit, margin };
}

function renderTable() {
  profitBody.innerHTML = "";
  profitData.forEach((item, index) => {
    const { profit, margin } = calculateProfit(item);
    profitBody.innerHTML += \`
      <tr class="border-b">
        <td class="p-2">\${item.jobNo}</td>
        <td class="p-2">\${item.customer}</td>
        <td class="p-2">\${item.charge}</td>
        <td class="p-2">\${item.actualCost}</td>
        <td class="p-2">\${profit}</td>
        <td class="p-2">\${margin}%</td>
        <td class="p-2 space-x-2">
          <button onclick="editRecord(\${index})" class="text-blue-600">Edit</button>
          <button onclick="deleteRecord(\${index})" class="text-red-600">Delete</button>
        </td>
      </tr>
    \`;
  });
}

function renderChart() {
  const labels = profitData.map(item => item.customer + " (" + item.jobNo + ")");
  const data = profitData.map(item => item.charge - item.actualCost);
  new Chart(profitChart, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Profit",
        data,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    }
  });
}

profitForm.onsubmit = e => {
  e.preventDefault();
  const jobNo = document.getElementById("jobNo").value;
  const customer = document.getElementById("customer").value;
  const charge = parseFloat(document.getElementById("charge").value);
  const actualCost = parseFloat(document.getElementById("actualCost").value);
  if (!jobNo || !customer || isNaN(charge) || isNaN(actualCost)) return showToast("Please fill all fields", false);
  profitData.push({ jobNo, customer, charge, actualCost });
  saveData();
  renderTable();
  renderChart();
  profitForm.reset();
  showToast("Record added");
};

function editRecord(index) {
  const item = profitData[index];
  document.getElementById("jobNo").value = item.jobNo;
  document.getElementById("customer").value = item.customer;
  document.getElementById("charge").value = item.charge;
  document.getElementById("actualCost").value = item.actualCost;
  deleteRecord(index);
}

function deleteRecord(index) {
  profitData.splice(index, 1);
  saveData();
  renderTable();
  renderChart();
  showToast("Record deleted");
}

document.getElementById("exportExcel").onclick = () => {
  const ws = XLSX.utils.json_to_sheet(profitData.map(item => ({
    "Job No": item.jobNo,
    Customer: item.customer,
    Charge: item.charge,
    "Actual Cost": item.actualCost,
    Profit: item.charge - item.actualCost,
    Margin: item.charge ? ((item.charge - item.actualCost) / item.charge * 100).toFixed(2) + "%" : "0%"
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Profit Data");
  XLSX.writeFile(wb, "profit-data.xlsx");
};

document.getElementById("logout-btn").onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};

renderTable();
renderChart();
