// Builds new row with input field and buttons
function rowBuilder() {
    const table = document.getElementById("checklistTable");
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

    // Build edit button
    let editButton = document.createElement("input");
    editButton.type = "button";
    editButton.value = "Edit";
    editButton.classList.add("editButton");
    editButton.id = `btnEdit${table.rows.length - 1}`;  // append this section to for simple list maker later
    editButton.addEventListener("click", editItem);
    cell1.appendChild(editButton);

    // Build checkbox cell with single checkbox
    let cell2 = newRow.insertCell(1);
    cell2.classList.add("col2");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    checkbox.id = "checkbox0";
    cell2.appendChild(checkbox);
    
    // Add "+" button to checkbox cell
    let addButton = document.createElement("input");
    addButton.type = "button";
    addButton.value = "+";
    addButton.classList.add("addButton");
    addButton.addEventListener("click", addBox);
    addButton.id = `btnAdd${table.rows.length - 1}`;
    cell2.appendChild(addButton);

    // Add "-" button to checkbox cell
    let removeButton = document.createElement("input");
    removeButton.type = "button";
    removeButton.value = "-";
    removeButton.classList.add("removeButton");
    removeButton.addEventListener("click", removeBox);
    removeButton.id = `btnRemove${table.rows.length - 1}`;
    cell2.appendChild(removeButton);
}

// Changes the way the Enter key behaves, and cleans up prints
function formControl() {
    document.getElementById("checkTitle").focus(); // Focus first input field on page load

    // Removes last row of table and hides buttons before printing
    window.addEventListener("beforeprint", function() {
        const table = document.getElementById("checklistTable");
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
            if (document.activeElement.id === "checkTitle" && document.activeElement.value !== nada) {
                writer();
            }
            if (document.activeElement.id === "itemName" && document.activeElement.value !== nada) {
                writer();
            }

            // Template Builder forms
            if (document.activeElement.id === "numRows") {
                document.getElementById("checkboxesPerRow").focus();
            }
            if (document.activeElement.id === "checkboxesPerRow") {
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
        titleField.id = "checkTitle";
        titleField.placeholder = "Checklist Title";
        titleCell.appendChild(titleField);
        const table = document.getElementById("checklistTable");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
        rowBuilder();
        document.getElementById("checkTitle").focus();
    } else {

        // For genListSize()
        const table = document.getElementById("checklistTable");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    }
}

// Generates blank, printable checklist based on Template Builder form values
function genListSize() {
    const table = document.getElementById("checklistTable");
    const numRows = document.getElementById("numRows").value;
    const numChecks = document.getElementById("checkboxesPerRow").value;
    if (numChecks < 1) {
        document.getElementById("checkboxesPerRow").focus();
        return;
    }
    clearTable();

    // Row generation
    for (let i = 0; i < numRows; i++) {
        const row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.classList.add("col1");
        let cell2 = row.insertCell(1);
        cell2.classList.add("col2");
        
        // Checkbox generation
        for (let j = 0; j < numChecks; j++) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            checkbox.id = `checkbox${j}`;
            cell2.appendChild(checkbox);
        }
    }
    
    // Resets row height for more handwriting space once printed
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
        row.style.height = "40px";
    });
}

// Handles writing to table
function writer() {
    
    // Title input handling
    if (document.activeElement.id === "checkTitle") {
        const titleInput = document.getElementById("checkTitle");
        const title = titleInput.value;
        const titleCell = document.getElementById("th1");
        titleInput.remove();
        titleCell.textContent = title;
        document.getElementById("itemName").focus();
    
    // Item input handling
    } else if (event.target.id === "itemName") {
        const table = document.getElementById("checklistTable");
        const itemInput = document.getElementById("itemName");
        const item = itemInput.value;
        const itemCell = document.getElementById(`p${table.rows.length - 1}`);
        const editButton = document.getElementById(`btnEdit${table.rows.length - 1}`);
        itemInput.remove();
        itemCell.textContent = item;
        itemCell.appendChild(editButton);
        rowBuilder();
        document.getElementById("itemName").focus();
    }
}

// Replaces item input field and focuses it when "Edit" button is clicked
function editItem() {
    const table = document.getElementById("checklistTable");
    const lastRow = table.rows.length - 1;
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btnEdit", ""));
    const row = table.rows[rowIndex];
    const cell1 = row.cells[0];
    let itemText = cell1.textContent;
    cell1.textContent = "";
    let editInput = document.createElement("input");
    editInput.type = "text";
    editInput.name = "editItem";
    editInput.id = "editItem";
    editInput.value = itemText;
    cell1.appendChild(editInput);
    editInput.focus();

    // Adds event listener for Enter key on edit input field
    editInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const newItem = editInput.value;
            cell1.textContent = newItem;
            const editButton = document.createElement("input");
            editButton.type = "button";
            editButton.value = "Edit";
            editButton.classList.add("editButton");
            editButton.id = `btnEdit${rowIndex}`;
            editButton.addEventListener("click", editItem);
            cell1.appendChild(editButton);
            table.deleteRow(lastRow);
            rowBuilder();
            document.getElementById("itemName").focus();
        }
    });
}

// Adds checkbox to row of clicked "+" button
function addBox() {
    const table = document.getElementById("checklistTable");
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btnAdd", ""));
    const row = table.rows[rowIndex];
    const cell2 = row.cells[1];
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    checkbox.id = `checkbox${cell2.querySelectorAll(".checkbox").length}`;
    cell2.appendChild(checkbox);
}

// Removes last checkbox from row of clicked "-" button
function removeBox() {
    const table = document.getElementById("checklistTable");
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btnRemove", ""));
    const row = table.rows[rowIndex];
    const cell2 = row.cells[1];
    const checkboxes = cell2.querySelectorAll(".checkbox");
    if (checkboxes.length > 1) {
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
    const lastRow = table.rows.length - 1;
    table.deleteRow(lastRow);
    
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
    
    // Set up JSON and download it
    const jsonData = JSON.stringify({ title: listTitle, items: tableData });
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist-${listTitle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    rowBuilder();   // Add blank row back to table after export
}

// Imports JSON file and populates table with data
function importChecklist() {
    
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
            const table = document.getElementById("checklistTable");
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

                // Add checkboxes
                const checkboxCell = row.insertCell(1);
                for (let i = 0; i < item.checkEnum; i++) {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.classList.add("checkbox");
                    checkbox.id = `checkbox${i}`;
                    checkboxCell.appendChild(checkbox);
                    checkboxCell.style.textAlign = "center";
                }
            }
            rowBuilder();   // Add blank row back to table after import
        };
        reader.readAsText(file);
    };
    input.click();
}