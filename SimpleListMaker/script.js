// Builds new row with input field and buttons
function rowBuilder() {
    const table = document.getElementById("listTable");
    const newRow = table.insertRow(-1);

    // Build item cell with input field
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
}

// Changes the way the Enter key behaves, and cleans up prints
function formControl() {
    document.getElementById("listTitle").focus(); // Focus first input field on page load

    // Removes last row of table and hides buttons before printing
    window.addEventListener("beforeprint", function() {
        const table = document.getElementById("listTable");
        const lastRow = table.rows.length - 1;
        if (table.contains(document.getElementById(`itemName`))) {
            table.deleteRow(lastRow);
        }
        document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "hidden");
        document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "hidden");
    });

    // Adds removed row back to table, and shows buttons
    window.addEventListener("afterprint", function() {
        rowBuilder();
        document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "visible");
        document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "visible");
    });

    // Add event listener for Enter key on all input fields
    const nada = " " || "" || 0 || "0" || null || undefined;
    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();

            // Checklist forms
            if (document.activeElement.id === "listTitle" && document.activeElement.value !== nada) {
                writer();
            }
            if (document.activeElement.id === "itemName" && document.activeElement.value !== nada) {
                writer();
            }

            // Template Builder form
            if (document.activeElement.id === "numRows") {
                genListSize();
            }
        }
    });
}

// Clears all table rows except header
function clearTable() {

    // Resets form if clear button was clicked
    if (document.activeElement.id === "clearBtn") {
        const titleCell = document.getElementById("th1");
        titleCell.textContent = "";
        const titleField = document.createElement("input");
        titleField.type = "text";
        titleField.id = "listTitle";
        titleField.placeholder = "List Title";
        titleCell.appendChild(titleField);
        const table = document.getElementById("listTable");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
        rowBuilder();
        document.getElementById("listTitle").focus();
    } else {

        // For genListSize()
        const table = document.getElementById("listTable");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    }
}

// Generates blank, printable checklist based on Template Builder form values
function genListSize() {
    const table = document.getElementById("listTable");
    const numRows = document.getElementById("numRows").value;
    clearTable();

    // Row generation
    for (let i = 0; i < numRows; i++) {
        const row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.classList.add("col1");
    }
    rowBuilder();
    
    // Resets row height for more handwriting space once printed
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
        row.style.height = "40px";
    });
}

function writer() {
    
    // Title input handling
    if (document.activeElement.id === "listTitle") {
        const titleInput = document.getElementById("listTitle");
        const title = titleInput.value;
        const titleCell = document.getElementById("th1");
        titleInput.remove();
        titleCell.textContent = title;
        document.getElementById("itemName").focus();
    
    // Item input handling
    } else if (event.target.id === "itemName") {
        const table = document.getElementById("listTable");
        const itemInput = document.getElementById("itemName");
        const item = itemInput.value;
        const itemCell = document.getElementById(`p${table.rows.length - 1}`);
        itemInput.remove();
        itemCell.textContent = item;
        rowBuilder();
        document.getElementById("itemName").focus();
    }
}

// Exports table data as JSON file
function exportList() {
    const table = document.getElementById("listTable");
    const tableData = [];
    const titleCell = document.getElementById("th1");
    const listTitle = titleCell.textContent;
    const lastRow = table.rows.length - 1;
    table.deleteRow(lastRow);
    
    // Pull item text for each row
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const itemCell = row.cells[0];
        const item = itemCell.textContent;
        tableData.push({ item });
    }
    
    // Set up JSON and download it
    const jsonData = JSON.stringify({ title: listTitle, items: tableData });
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `list-${listTitle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    rowBuilder();   // Add blank row back to table after export
}

// Imports JSON file and populates table with data
function importList() {
    
    // Read JSON and populate table
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    // Handle file selection and reading
    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        // Parse JSON and populate table
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            
            // Set title
            const table = document.getElementById("listTable");
            const titleCell = document.getElementById("th1");
            titleCell.textContent = data.title;
            
            // Clear existing rows
            for (let i = table.rows.length - 1; i > 0; i--) {
                table.deleteRow(i);
            }
            
            // Populate table with imported data
            for (const item of data.items) {

                // Add new row and item text
                const row = table.insertRow();
                const itemCell = row.insertCell(0);
                itemCell.textContent = item.item;
                itemCell.style.textAlign = "center";
            }
            rowBuilder();   // Add blank row back to table after import
        };
        reader.readAsText(file);
    };
    input.click();
}