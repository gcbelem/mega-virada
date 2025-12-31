const checkButton = document.querySelector("#check-result");

checkButton.addEventListener("click", () => {
    runLottery();
})

async function runLottery() {
    let data = await fetchSpreadsheet();
    let ticket = populateTicket(data);
    let result = checkTicket(ticket);
    updateUI(result);
}

async function fetchSpreadsheet() {
    const apiKey =
    "AIzaSyABJNX7TCI_0oZ6gF85d10c0C-KZUpq0tE";

    const spreadsheet = 
    "14US41LIOqn16BZKSaH562dcA0ClQdWOGmncJcbmeqwA";

    const range = 
    "Apostas"

    try {
       const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/${range}?key=${apiKey}`
    );

    if (!response.ok) {
            console.log("Error fetching data");
            return null
        }

        const parse = await response.json();
        const data = parse.values; 

        return data;
    }

    catch (error) {
        console.error("Request failed", error)
        return null
    }
};

function populateTicket(data) {
    const normalizeTicket = data.slice(1);
    const numbersPerTicket = 6;
    const numColumns = normalizeTicket[0].length;
    const lotteryTicket = [];

    for (let col = 0; col < numColumns; col++) {
        const ticket = [];
        for (let n = 0; n < numbersPerTicket; n++) {
            ticket.push(normalizeTicket[n][col]);
        }
        lotteryTicket.push(ticket);
    }

    return lotteryTicket;
}

function checkTicket(tickets) {
    const userInput = Array.from(document.querySelectorAll('input[type="number"]'))
                        .map(input => input.value)
                        .filter(values => values !== "");
   
    const finalResult = [];

    tickets.forEach(ticket => {
        const hits = ticket.filter(number => userInput.includes(number));
        const hitCounter = hits.length;

        if (hitCounter === 0) return;

        if (!finalResult[hitCounter]) {
            finalResult[hitCounter] = [];
        }

        finalResult[hitCounter].push({
            ticket,
            hits,
            hitCounter
        });
    });

    return finalResult;
}

function updateUI(result) {
    const resultContainer = document.querySelector("#result");
    if (!resultContainer) return;

    resultContainer.innerHTML = "";

    const allTickets = [];
    result.forEach((tickets, hitCount) => {
        if (!tickets) return;
        tickets.forEach(ticketObj => {
            allTickets.push({ ...ticketObj, hitCount });
        });
    });

    allTickets.sort((a, b) => b.hitCount - a.hitCount);

    const summaryBox = document.createElement("div");
    summaryBox.classList.add("summary-box");

    const summaryHeader = document.createElement("h2");
    summaryHeader.textContent = "Melhores Combinações";
    summaryBox.appendChild(summaryHeader);

    allTickets.forEach(ticketObj => {
        const ticketLine = document.createElement("p");
        ticketLine.textContent = `Acertos: ${ticketObj.hitCount} — Números Jogados: ${ticketObj.ticket.join(", ")} — Números Corretos: ${ticketObj.hits.join(", ") || "Nenhum"}`;
        ticketLine.classList.add("summary-ticket");
        summaryBox.appendChild(ticketLine);
    });

    resultContainer.appendChild(summaryBox);

    const grouped = {};
    allTickets.forEach(ticketObj => {
        if (!grouped[ticketObj.hitCount]) grouped[ticketObj.hitCount] = [];
        grouped[ticketObj.hitCount].push(ticketObj);
    });
}