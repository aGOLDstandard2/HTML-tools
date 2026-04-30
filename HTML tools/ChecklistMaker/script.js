function formControl() {
    // Focus first input field on page load
    document.getElementById("checkTitle").focus();

    // Add event listener for Enter key on all input fields
    const numRowsInput = document.getElementById("numRows");
    const numChecksInput = document.getElementById("checkboxesPerRow");
    const nada = 0 || "0" || null || undefined;
    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();

            // Checklist forms
            if (document.activeElement.id === "checkTitle" && document.activeElement.value !== "" || null) {
                titleWriter();
            }
            if (document.activeElement.id === "itemName" && document.activeElement.value !== "" || null) {
                writer();
            }

            // Template Builder forms
            if (document.activeElement.id === "numRows") {
                numChecksInput.focus();
            }
            if (document.activeElement.id === "checkboxesPerRow") {
                if (numRowsInput.value !== nada && numChecksInput.value !== nada) {
                    genListSize();
                }
            }
        }
    });
    buttonReader();

    // Add event listener to window.print to remove last row before printing
    window.addEventListener("beforeprint", function() {
        const table = document.getElementById("checklistTable");
        const lastRow = table.rows.length - 1;
        if (table.contains(document.getElementById(`itemName`))) {
            table.deleteRow(lastRow);
        }
    });
}

function buttonReader() {
    const buttons = document.querySelectorAll(".checkButton");
    buttons.forEach(button => {
        button.addEventListener("click", function(event) {
            console.log("Button clicked", event.target.id);
        });
    });
}

function genListSize() {
    const table = document.getElementById("checklistTable");
    const numRows = document.getElementById("numRows").value;
    const numChecks = document.getElementById("checkboxesPerRow").value;
    for (let i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }
    for (let i = 0; i < numRows; i++) {
        const row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.classList.add("col1");
        let cell2 = row.insertCell(1);
        cell2.classList.add("col2");
        for (let j = 0; j < numChecks; j++) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            cell2.appendChild(checkbox);
        }
    }
}

function titleWriter() {
    const titleInput = document.getElementById("checkTitle");
    const title = titleInput.value;
    const titleCell = document.getElementById("th1");
    titleInput.remove();
    titleCell.textContent = title;
    document.getElementById("itemName").focus();
}

function writer() {
    const table = document.getElementById("checklistTable");
    const itemInput = document.getElementById("itemName");
    const item = itemInput.value;
    const itemCell = document.getElementById(`p${table.rows.length - 1}`);

    // Remove input field and set cell text to it's value
    itemInput.remove();
    itemCell.textContent = item;

    // Add new row with input field for next item
    const newRow = table.insertRow(-1);
    let cell1 = newRow.insertCell(0);
    cell1.classList.add("col1");
    let newParagraph = document.createElement("p");
    newParagraph.id = `p${table.rows.length - 1}`;
    cell1.appendChild(newParagraph);
    let newInput = document.createElement("input");
    newInput.type = "text";
    newInput.name = "itemName";
    newInput.id = "itemName";
    newInput.placeholder = `Item${table.rows.length - 1}`;
    cell1.appendChild(newInput);
    
    // Add button to new row
    let cell2 = newRow.insertCell(1);
    cell2.classList.add("col2");
    let button = document.createElement("input");
    button.type = "button";
    button.value = "+";
    button.classList.add("button");
    button.addEventListener("click", addBox);
    button.id = `btn${table.rows.length - 1}`;
    cell2.appendChild(button);
    buttonReader();

    // Add checkbox to new row
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    cell2.appendChild(checkbox);

    // Focus new input field
    newInput.focus();
}

function addBox() {
    const table = document.getElementById("checklistTable");
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btn", ""));
    const row = table.rows[rowIndex];
    const cell2 = row.cells[1];
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    cell2.appendChild(checkbox);
}