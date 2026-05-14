let pieChart;

// -----------------------
// LOAD ORDERS
// -----------------------
async function loadOrders() {

    let res = await fetch("http://127.0.0.1:8000/orders");
    let data = await res.json();

    let table = document.getElementById("orderTable");
    table.innerHTML = "";

    // 🔥 RESET COUNTS
    let placed = 0;
    let delivered = 0;
    let preparing = 0;

    data.reverse().forEach(o => {

        // 🔥 COUNT FIX
        if (o.status.trim() === "placed") {
            placed++;
        }

        if (o.status.trim() === "preparing") {
            preparing++;
        }

        if (o.status.trim() === "delivered") {
            delivered++;
        }

        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${o.item}</td>
            <td>${o.restaurant}</td>

            <td>
                <select id="s-${o.id}">
                    <option value="placed" ${o.status=="placed"?"selected":""}>placed</option>

                    <option value="preparing" ${o.status=="preparing"?"selected":""}>preparing</option>

                    <option value="delivered" ${o.status=="delivered"?"selected":""}>delivered</option>
                </select>
            </td>

            <td>
                <button onclick="updateOrder(${o.id})">
                    Update
                </button>

                <button onclick="deleteOrder(${o.id})"
                    class="delete">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(tr);
    });

    // 🔥 UPDATE CARDS
    document.getElementById("totalOrders").innerText = data.length;

    document.getElementById("placedCount").innerText = placed;

    document.getElementById("preparingCount").innerText = preparing;

    document.getElementById("deliveredCount").innerText = delivered;

    // 🔥 UPDATE CHART
    loadPieChart(placed, preparing, delivered);
}


// -----------------------
// PIE CHART
// -----------------------
function loadPieChart(placed, preparing, delivered) {

    let ctx = document.getElementById("pieChart").getContext("2d");

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
        type: "pie",

        data: {
            labels: [
                `Placed (${placed})`,
                `Preparing (${preparing})`,
                `Delivered (${delivered})`
            ],

            datasets: [{
                data: [placed, preparing, delivered],

                backgroundColor: [
                    "orange",
                    "blue",
                    "green"
                ]
            }]
        }
    });
}


// -----------------------
// UPDATE ORDER
// -----------------------
async function updateOrder(id) {

    let status =
        document.getElementById(`s-${id}`).value;

    await fetch(
        "http://127.0.0.1:8000/update-order",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                order_id: id,
                status: status
            })
        }
    );

    loadOrders();
}


// -----------------------
// DELETE ORDER
// -----------------------
async function deleteOrder(id) {

    if (!confirm("Delete this order?")) return;

    await fetch(
        `http://127.0.0.1:8000/delete-order/${id}`,
        {
            method: "DELETE"
        }
    );

    loadOrders();
}


// -----------------------
// NAVIGATION
// -----------------------
function goDashboard() {
    window.location.href = "dashboard.html";
}


// -----------------------
// INIT
// -----------------------
loadOrders();


// 🔥 AUTO REFRESH
setInterval(loadOrders, 10000);