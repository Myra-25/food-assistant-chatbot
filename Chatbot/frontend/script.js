const chat = document.getElementById("chat");

// -------------------------------
// 💬 ADD MESSAGE
// -------------------------------
function addMessage(text, sender) {

    let div = document.createElement("div");
    div.className = `msg ${sender}`;

    if (sender === "bot") {

        div.innerHTML = `
            <img class="avatar"
            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png">

            ${text}
        `;

    } else {

        div.innerText = text;

    }

    chat.appendChild(div);

    chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "smooth"
    });
}


// -------------------------------
// ⌨️ TYPING EFFECT
// -------------------------------
function showTyping() {

    let div = document.createElement("div");

    div.className = "msg bot";

    div.innerHTML = `
        <img class="avatar"
        src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png">

        <span class="typing">
            ⏳ Typing...
        </span>
    `;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;

    return div;
}


// -------------------------------
// 💬 SEND MESSAGE
// -------------------------------
async function sendMessage() {

    let input = document.getElementById("msg");

    let msg = input.value.trim();

    if (!msg) return;

    addMessage(msg, "user");

    input.value = "";

    // 🔥 COMPLAINT OPTIONS
    if (msg === "1") {

        addMessage(
            "😔 Sorry for late delivery. We will improve delivery speed.",
            "bot"
        );

        return;
    }

    if (msg === "2") {

        addMessage(
            "🍔 Sorry for wrong item issue. Replacement initiated.",
            "bot"
        );

        return;
    }

    if (msg === "3") {

        addMessage(
            "🍽 Sorry for food quality issue. Restaurant notified.",
            "bot"
        );

        return;
    }

    if (msg === "4") {

        addMessage(
            "💳 Payment issue detected. Support team will contact you.",
            "bot"
        );

        return;
    }

    let typing = showTyping();

    try {

        let res = await fetch("http://127.0.0.1:8000/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: msg
            })

        });

        let data = await res.json();

        typing.remove();

        addMessage(data.response, "bot");

        // 🍔 ORDER FLOW
        if (msg.toLowerCase().includes("order food")) {

            loadRestaurants();

        }

        // 📦 TRACK ORDER
        if (msg.toLowerCase().includes("track")) {

            loadOrders();

        }

    }

    catch (e) {

        typing.remove();

        addMessage("⚠ Server error", "bot");

    }
}


// -------------------------------
// ⌨️ ENTER KEY
// -------------------------------
document.getElementById("msg")
.addEventListener("keydown", function(e) {

    if (e.key === "Enter") {

        sendMessage();

    }

});


// -------------------------------
// ⚡ QUICK MESSAGE
// -------------------------------
function quickMsg(text) {

    document.getElementById("msg").value = text;

    sendMessage();

}


// -------------------------------
// 🔥 START COMPLAINT
// -------------------------------
function startComplaint(){

    addMessage("complaint", "user");

    addMessage(`
        Please select your issue:<br><br>

        1️⃣ Late delivery <br>
        2️⃣ Wrong item <br>
        3️⃣ Food quality <br>
        4️⃣ Payment issue
    `, "bot");

}


// -------------------------------
// 🍽 LOAD RESTAURANTS
// -------------------------------
async function loadRestaurants() {

    let res = await fetch("http://127.0.0.1:8000/restaurants");

    let data = await res.json();

    data.forEach(r => {

        let card = document.createElement("div");

        card.className = "card";

        let img = document.createElement("img");

        img.src = r.image;

        let body = document.createElement("div");

        body.className = "card-body";

        let name = document.createElement("div");

        name.innerText = r.name;

        name.style.fontWeight = "bold";

        let info = document.createElement("div");

        info.innerText = `⭐ ${r.rating} • ${r.time}`;

        let btn = document.createElement("button");

        btn.innerText = "🍔 Order Now";

        btn.onclick = () => placeOrder(r.name);

        body.appendChild(name);

        body.appendChild(info);

        body.appendChild(btn);

        card.appendChild(img);

        card.appendChild(body);

        chat.appendChild(card);

    });

}


// -------------------------------
// 🛒 PLACE ORDER
// -------------------------------
window.placeOrder = async function(restaurant) {

    await fetch("http://127.0.0.1:8000/order", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            item: "Food",

            restaurant: restaurant

        })

    });

    addMessage(
        `✅ Order placed from ${restaurant}`,
        "bot"
    );

}


// -------------------------------
// 📦 LOAD ORDERS
// -------------------------------
async function loadOrders() {

    let res = await fetch("http://127.0.0.1:8000/orders");

    let data = await res.json();

    if (data.length === 0) {

        addMessage("No orders found", "bot");

        return;

    }

    let o = data[data.length - 1];

    addMessage(
        `📦 ${o.item} from ${o.restaurant} → ${o.status}`,
        "bot"
    );

}


// -------------------------------
// 🌙 DARK MODE
// -------------------------------
function toggleTheme(){

    document.body.classList.toggle("dark-mode");

    let btn = document.getElementById("themeBtn");

    if(document.body.classList.contains("dark-mode")){

        btn.innerText = "☀️";

        localStorage.setItem("theme","dark");

    }
    else{

        btn.innerText = "🌙";

        localStorage.setItem("theme","light");

    }

}


// -------------------------------
// 💾 SAVE THEME
// -------------------------------
window.onload = () => {

    let savedTheme = localStorage.getItem("theme");

    if(savedTheme === "dark"){

        document.body.classList.add("dark-mode");

        document.getElementById("themeBtn").innerText = "☀️";

    }

};


// -------------------------------
// 🎤 VOICE
// -------------------------------
function startVoice() {

    alert("🎤 Coming soon...");

}