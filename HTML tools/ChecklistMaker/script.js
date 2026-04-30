function formControl() {
    // Focus first input field on page load
    document.getElementById("checkTitle").focus();

    // Add event listener for Enter key on all input fields
    const numRowsInput = document.getElementById("numRows");
    const numChecksInput = document.getElementById("checkboxesPerRow");
    const nada = 0 || "0" || null || undefined;
    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {

            // Checklist forms
            if (document.activeElement.id === "checkTitle" && document.activeElement.value !== "" || null) {
                event.preventDefault();
                titleWriter();
            }
            if (document.activeElement.id === "itemName" && document.activeElement.value !== "" || null) {
                event.preventDefault();
                writer();
            }

            // Template Builder forms
            if (document.activeElement.id === "numRows") {
                event.preventDefault();
                numChecksInput.focus();
            }
            if (document.activeElement.id === "checkboxesPerRow") {
                if (numRowsInput.value !== nada && numChecksInput.value !== nada) {
                    event.preventDefault();
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
        document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "hidden");
        document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "hidden");
    });

    // Event listener to rebuild row after printing
    window.addEventListener("afterprint", function() {
        const table = document.getElementById("checklistTable");
        const newRow = table.insertRow(-1);
        
        // Add input field to new row
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
        
        // Add checkbox to new row
        let cell2 = newRow.insertCell(1);
        cell2.classList.add("col2");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("checkbox");
        checkbox.id = "checkbox0";
        cell2.appendChild(checkbox);

        // Add buttons to new row
        let addButton = document.createElement("input");
        addButton.type = "button";
        addButton.value = "+";
        addButton.classList.add("addButton");
        cell2.appendChild(addButton);
        let removeButton = document.createElement("input");
        removeButton.type = "button";
        removeButton.value = "-";
        removeButton.classList.add("removeButton");
        cell2.appendChild(removeButton);

        // Show buttons
        document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "visible");
        document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "visible");
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
            checkbox.id = `checkbox${j}`;
            cell2.appendChild(checkbox);
        }
    }
    // need to increase row height to 50px
        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
            row.style.height = "50px";
        });
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
    //document.getElementById("td").style.height = "40px";

    // Add checkbox to new row
    let cell2 = newRow.insertCell(1);
    cell2.classList.add("col2");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    checkbox.id = "checkbox0";
    cell2.appendChild(checkbox);
    
    // Add buttons to new row
    let addButton = document.createElement("input");
    addButton.type = "button";
    addButton.value = "+";
    addButton.classList.add("addButton");
    addButton.addEventListener("click", addBox);
    addButton.id = `btn${table.rows.length - 1}`;
    cell2.appendChild(addButton);
    let removeButton = document.createElement("input");
    removeButton.type = "button";
    removeButton.value = "-";
    removeButton.classList.add("removeButton");
    removeButton.addEventListener("click", removeBox);
    removeButton.id = `btnRemove${table.rows.length - 1}`;
    cell2.appendChild(removeButton);
    buttonReader();

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
    checkbox.id = `checkbox${cell2.querySelectorAll(".checkbox").length}`;
    cell2.appendChild(checkbox);
    const button = document.getElementById(buttonId);
    cell2.appendChild(button);
    // need to identify new remove button and move it to end of cell2
        const removeButtonId = `btnRemove${rowIndex}`;
        const removeButton = document.getElementById(removeButtonId);
        cell2.appendChild(removeButton);
}

function removeBox() {
    const table = document.getElementById("checklistTable");
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btnRemove", ""));
    const row = table.rows[rowIndex];
    const cell2 = row.cells[1];
    const checkboxes = cell2.querySelectorAll(".checkbox");
    if (checkboxes.length > 0) {
        const lastCheckbox = checkboxes[checkboxes.length - 1];
        cell2.removeChild(lastCheckbox);
    }
}

// Exports table data as JSON file
function exportChecklist() {
    const table = document.getElementById("checklistTable");
    const tableData = [];
    const titleCell = document.getElementById("th1");
    const listTitle = titleCell.textContent;
    
    // Pull item text and enum checkboxes for each row
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const itemCell = row.cells[0];
        const checkboxCell = row.cells[1];
        const item = itemCell.textContent;
        const checkboxes = checkboxCell.querySelectorAll(".checkbox");
        const checkEnum = checkboxes.length;
        tableData.push({ item, checkEnum });
    }
    
    // Export tableData as JSON file
    const jsonData = JSON.stringify({ title: listTitle, items: tableData });
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${listTitle}_checklist.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}