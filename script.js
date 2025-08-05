let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = 10000; // Default budget
let pieChart, barChart, lineChart;

// Load budget from localStorage, or set a default
if (localStorage.getItem("budget")) {
    budget = parseFloat(localStorage.getItem("budget"));
}

document.getElementById("expense-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const currentTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Check if adding this expense will exceed the budget
  if (currentTotal + amount > budget) {
    showToast("Aap budget se bahar ho rahe hain! Kharch nahi joda ja sakta.", 'error'); 
    return; 
  }

  const expense = { title, amount, category, date };
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateAll();
  this.reset();
  showToast("Kharch joda gaya!", 'success'); 
});

function updateAll() {
  updateBudget();
  updateCharts();
  updateHistory();
}

function updateBudget() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percent = Math.min((total / budget) * 100, 100);
  document.getElementById("budget-bar").style.width = percent + "%";
  document.getElementById("budget-status").textContent = `₹${total.toFixed(2)} / ₹${budget} kharch hua (${Math.round(percent)}%)`;

  const budgetBar = document.getElementById("budget-bar");
  if (total > budget) {
    budgetBar.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-red');
    document.getElementById("budget-status").textContent += " - Budget se bahar!";
  } else {
    budgetBar.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-green');
  }
}

function updateCharts() {
  const categoryMap = {}, monthlyMap = {}, dailyMap = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    const month = e.date.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] || 0) + e.amount;
    dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount;
  });

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();
  const accentGreen = getComputedStyle(document.body).getPropertyValue('--accent-green').trim();
  const accentRed = getComputedStyle(document.body).getPropertyValue('--accent-red').trim();
  const primaryDark = getComputedStyle(document.body).getPropertyValue('--primary-dark').trim();
  const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim();
  const borderColor = getComputedStyle(document.body).getPropertyValue('--border-color').trim();


  const pieColors = ["#EF5350", "#66BB6A", "#42A5F5", "#FFCA28", "#AB47BC"];

  const commonPlugins = {
    legend: {
      labels: {
        color: textColor,
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    tooltip: {
      titleColor: textColor,
      bodyColor: textColor,
      backgroundColor: '#333',
      borderColor: borderColor,
      borderWidth: 1
    }
  };

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: pieColors
      }]
    },
    options: {
      responsive: true,
      plugins: commonPlugins
    }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: Object.keys(monthlyMap),
      datasets: [{
        label: "Monthly Spend",
        data: Object.values(monthlyMap),
        backgroundColor: primaryColor
      }]
    },
    options: {
      responsive: true,
      plugins: commonPlugins,
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 12
            }
          },
          grid: {
            color: borderColor
          }
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 12
            }
          },
          grid: {
            color: borderColor
          }
        }
      }
    }
  });

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: Object.keys(dailyMap),
      datasets: [{
        label: "Daily Spend",
        data: Object.values(dailyMap),
        borderColor: accentGreen,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: commonPlugins,
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 12
            }
          },
          grid: {
            color: borderColor
          }
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 12
            }
          },
          grid: {
            color: borderColor
          }
        }
      }
    }
  });
}

function updateHistory() {
  const tbody = document.getElementById("history-table");
  tbody.innerHTML = "";
  const search = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filterCategory").value;

  expenses.forEach((e, i) => {
    if ((filter && e.category !== filter) || (search && !e.title.toLowerCase().includes(search))) return;
    tbody.innerHTML += `<tr><td>${e.title}</td><td>₹${e.amount}</td><td>${e.category}</td><td>${e.date}</td><td><button onclick="deleteExpense(${i})">❌</button></td></tr>`;
  });
}

function deleteExpense(i) {
  expenses.splice(i, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateAll();
  showToast("Kharch hataya gaya!", 'success');
}

function clearExpenses() {
  if (confirm("Kya aap sach mein saare kharch hatana chahte hain? Yeh action wapas nahi liya ja sakta.")) {
    expenses = [];
    localStorage.removeItem("expenses");
    updateAll();
    showToast("Saare kharch hata diye gaye!", 'success');
  }
}

function updateUserBudget() {
  const newBudget = parseFloat(document.getElementById("budgetInput").value);
  if (!isNaN(newBudget) && newBudget > 0) {
    budget = newBudget;
    localStorage.setItem("budget", budget);
    updateBudget();
    showToast("Budget update kiya gaya!", 'success');
  } else {
      showToast("Kripya sahi budget amount darj karein.", 'error');
  }
}

function downloadCSV() {
  let csv = "Title,Amount,Category,Date\n";
  expenses.forEach(e => {
    csv += `${e.title},${e.amount},${e.category},${e.date}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("CSV download kiya gaya!", 'success');
}

function switchPage(id) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
  document.querySelectorAll('nav .nav-links li').forEach(li => li.classList.remove('active'));
  // Find the list item that corresponds to the clicked page and add 'active' class
  const navLinks = document.querySelectorAll('nav .nav-links li');
  navLinks.forEach(li => {
    if (li.onclick && li.onclick.toString().includes(`switchPage('${id}')`)) {
      li.classList.add('active');
    }
  });
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById("toast");
  toast.textContent = msg;

  // Remove previous type classes
  toast.classList.remove('toast-success', 'toast-error', 'toast-info');

  // Add new type class
  if (type === 'success') {
    toast.classList.add('toast-success');
  } else if (type === 'error') {
    toast.classList.add('toast-error');
  } else {
    toast.classList.add('toast-info');
  }


  toast.style.display = "block";
  toast.style.animation = 'none';
  void toast.offsetWidth;
  toast.style.animation = 'slideFadeIn 0.4s ease-out forwards, slideFadeOut 0.4s ease-in forwards 2s';

  // For mobile, use different animation
  if (window.innerWidth <= 768) {
    toast.style.animation = 'fadeToastIn 0.4s ease-out forwards, fadeToastOut 0.4s ease-in forwards 2s';
  }
}


function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  updateCharts();
  showToast("Theme badal gaya!", 'info');
}

document.getElementById("search").addEventListener("input", updateHistory);
document.getElementById("filterCategory").addEventListener("change", updateHistory);

// Initialize
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
} else {
    document.body.classList.remove("dark");
}

updateAll();
// Set initial active page (Dashboard)
document.getElementById('dashboard').style.display = 'block';
document.querySelector('nav .nav-links li:first-child').classList.add('active');