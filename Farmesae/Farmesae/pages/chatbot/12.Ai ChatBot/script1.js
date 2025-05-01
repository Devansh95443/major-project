// ===== Constants =====
const Gemini_Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAkczfJOIrYK0JAsLBTZ9Q1v17utiYtiUY";
const Weather_Api_Key = "1d3af5eb91ff2111c82d21cd5523953b"; // OpenWeatherMap API key

const prompt = document.querySelector("#prompt");
const submitbtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imagebtn = document.querySelector("#image");
const image = document.querySelector("#image img");
const imageinput = document.querySelector("#image input");

// ===== User Input Object =====
let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

// ===== Helper to Create Chat Box =====
function createChatBox(html, classes) {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// ====== Show Welcome Message ======
function showWelcomeMessage() {
    const html = `
    <img src="ai.png" alt="" width="10%">
    <div class="ai-chat-area">
        🌾 Hello! Welcome to FarmEase.<br>
        Ask me about: crop tips, market rates, government schemes, or weather updates!
    </div>`;
    
    const aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
}

// ====== Fetch Weather ======
async function fetchWeatherInfo(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Weather_Api_Key}&units=metric`);
        if (!response.ok) {
            return "❌ Sorry, couldn't find weather for this city.";
        }
        let data = await response.json();
        let temp = data.main.temp;
        let desc = data.weather[0].description;
        let humidity = data.main.humidity;
        let wind = data.wind.speed;

        return `🌤 Weather in ${city}:<br>
                - Temperature: ${temp}°C<br>
                - Condition: ${desc}<br>
                - Humidity: ${humidity}%<br>
                - Wind Speed: ${wind} m/s`;
    } catch (error) {
        return "❌ Sorry, there was an error fetching weather.";
    }
}

// ====== Handle User Message ======
function handlechatResponse(userMessage) {
    user.message = userMessage.trim();
    if (!user.message && !user.file.data) return;

    const html = `
    <img src="user.png" alt="" width="8%">
    <div class="user-chat-area">
        ${user.message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>`;

    prompt.value = "";
    const userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        const html = `
        <img src="ai.png" alt="" width="10%">
        <div class="ai-chat-area">
            <img src="loading.webp" alt="Loading..." class="load" width="50px">
        </div>`;
        const aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// ====== Main Function to Handle Gemini or Weather ======
async function generateResponse(aiChatBox) {
    const text = aiChatBox.querySelector(".ai-chat-area");

    try {
        // Check for weather query
        if (user.message.toLowerCase().includes("weather")) {
            text.innerHTML = "🌍 Please enter the city name to get weather information!";
            let cityPrompt = await getUserCity();
            let weatherData = await fetchWeatherInfo(cityPrompt);
            text.innerHTML = weatherData;
            return;
        }

        // Check for government schemes
        if (user.message.toLowerCase().includes("scheme") || user.message.toLowerCase().includes("yojana")) {
            text.innerHTML = `
                🌾 Some popular Government Schemes:<br><br>
                • PM-Kisan Samman Nidhi<br>
                • PM Fasal Bima Yojana (Crop Insurance)<br>
                • E-NAM (National Agriculture Market)<br>
                • Kisan Credit Card (KCC)<br>
                • Soil Health Card Scheme<br><br>
                Type any name to get more info!`;
            return;
        }

        // Otherwise, use Gemini AI
        let RequestOption = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            { text: user.message },
                            (user.file.data ? [{ inline_data: user.file }] : [])
                        ]
                    }
                ]
            })
        };

        let response = await fetch(Gemini_Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } 
    catch (error) {
        console.log(error);
        text.innerHTML = "❌ Sorry, there was a problem getting a response.";
    }
    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {};
    }
}

// ====== Helper to Get User City after asking weather ======
function getUserCity() {
    return new Promise(resolve => {
        let tempInput = document.createElement("input");
        tempInput.placeholder = "Enter city name...";
        tempInput.classList.add("city-input");
        chatContainer.appendChild(tempInput);
        tempInput.focus();

        tempInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                let city = tempInput.value.trim();
                chatContainer.removeChild(tempInput);
                resolve(city);
            }
        });
    });
}

// ====== Image Upload Logic ======
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});

// ====== Listeners ======
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlechatResponse(prompt.value);
});
submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

// ====== Welcome Message ======
window.onload = showWelcomeMessage;
