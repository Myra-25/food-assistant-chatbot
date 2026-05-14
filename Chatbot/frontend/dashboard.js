document.addEventListener("DOMContentLoaded", function () {
    loadAnalytics();
    loadPieChart();
    loadBarChart();
});



// -------------------------------
// 📊 ANALYTICS CARDS
// -------------------------------
async function loadAnalytics() {
    try {
        let res = await fetch("http://127.0.0.1:8000/analytics");

        if (!res.ok) throw new Error("Analytics failed");

        let data = await res.json();

        console.log("ANALYTICS:", data);

        document.getElementById("total").innerText = data.total_messages;
        document.getElementById("success").innerText = data.success;
        document.getElementById("fallback").innerText = data.fallback;
        document.getElementById("orders").innerText = data.orders;

    } catch (e) {
        console.error("Analytics Error:", e);
    }
}

// -------------------------------
// 🥧 PIE CHART
// -------------------------------
let pieChart;

async function loadPieChart() {

    let res = await fetch("http://127.0.0.1:8000/orders");
    let data = await res.json();

    let placed = data.filter(o => o.status === "placed").length;
    let delivered = data.filter(o => o.status === "delivered").length;

    let canvas = document.getElementById("pieChart");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Placed", "Delivered"],
            datasets: [{
                data: [placed, delivered],
                backgroundColor: ["orange", "green"]
            }]
        }
    });
}

// -------------------------------
// 📊 BAR CHART
// -------------------------------
let barChart;

async function loadBarChart() {

    let res = await fetch("http://127.0.0.1:8000/analytics");
    let data = await res.json();

    let canvas = document.getElementById("barChart");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");

    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Total", "Success", "Fallback"],
            datasets: [{
                label: "Analytics",
                data: [
                    data.total_messages,
                    data.success,
                    data.fallback
                ]
            }]
        }
    });
}

// -------------------------------
// 🔄 UPDATE ORDER
// -------------------------------
async function updateOrder(id) {

    let status = document.getElementById(`s-${id}`).value;

    await fetch("http://127.0.0.1:8000/update-order", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            order_id: id,
            status: status
        })
    });
    loadAnalytics();
    loadPieChart();
    loadBarChart();
}

// -------------------------------
// ❌ DELETE ORDER
// -------------------------------
async function deleteOrder(id) {

    if (!confirm("Delete this order?")) return;

    try {
        let res = await fetch(`http://127.0.0.1:8000/delete-order/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            alert("Delete failed");
            return;
        }

        // 🔥 smooth reload
        await loadAnalytics();
        await loadPieChart();
        await loadBarChart();

    } catch (e) {
        console.error(e);
        alert("Server error");
    }
}
async function loadChatHistory(){

    let res = await fetch("http://127.0.0.1:8000/recent-chats");

    let data = await res.json();

    let table = document.getElementById("chatHistory");

    table.innerHTML = "";

    data.forEach(chat => {

        table.innerHTML += `
            <tr>
                <td>${chat.user}</td>
                <td>${chat.bot}</td>
                <td>${chat.status}</td>
            </tr>
        `;

    });

}

// -------------------------------
// 🔄 AUTO REFRESH
// -------------------------------
setInterval(() => {
    loadAnalytics();
    loadPieChart();
    loadBarChart();
    loadChatHistory();
}, 3000); // 🔥 faster refresh
function logout() {
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
}
function goOrders() {
    window.location.href = "orders.html";
}
