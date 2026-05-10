/* This script uses html2canvas

html2canvas is licensed under the MIT License:

---------------------------------------------------------------------

Copyright (c) 2012 Niklas von Hertzen

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

---------------------------------------------------------------------*/


/*------------------------------

          *On Load*

------------------------------*/


// Changes the way the Enter key behaves, and cleans up prints
function formControl() {
    document.getElementById("checkTitle").focus(); // Focus first input field on page load

    // Cleans up table for printing
    window.addEventListener("beforeprint", function() {

        // Inits multi-page reformatting if needed
        pageCheck();
    });

    // Adds removed row back to table, and shows buttons
    window.addEventListener("afterprint", function() {
        const tBoddies = document.querySelectorAll('tbody');
        const tBodyEnum = tBoddies.length;
        const table = document.getElementById('checklistTable1');
        if (tBodyEnum < 2) {
            const topItem = table.rows[1].cells[0];
            if (topItem.textContent !== "") {
                rowBuilder();
                document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "visible");
                document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "visible");
                document.querySelectorAll(".editButton").forEach(button => button.style.visibility = "visible");
                document.querySelectorAll(".deleteButton").forEach(button => button.style.visibility = "visible");
                document.getElementById('itemName').focus();
            }
        } else {
            const topItem = table.rows[1].cells[0];
            let template = false;
            console.log(topItem.textContent === "");
            if (!topItem.textContent) {
                template = true;
                multiPageUndo(template);
            } else {
                multiPageUndo(template);
            }
        }
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
            const table = document.getElementById(`checklistTable1`);
            const numRows = document.getElementById("numRows");
            const checksPerRow = document.getElementById("checkboxesPerRow");
            const templateTitle = document.getElementById("templateTitle");
            if (numRows && numRows.value) {
                document.getElementById('checkboxesPerRow').focus();
            }
            if (checksPerRow && checksPerRow.value) {
                templateTitle.focus();
            }
            if (templateTitle.value && checksPerRow.value && numRows.value) {
                genListSize(table, numRows.value, checksPerRow.value, templateTitle.value);
            }
        }
    });
}


/*------------------------------

      *Table Data Handling*

------------------------------*/


// Handles writing to table
function writer() {
    
    // Title input handling
    if (document.activeElement.id === "checkTitle") {
        const titleInput = event.target;
        const title = titleInput.value;
        if (title) {
            const titleCell = document.getElementById("th1");
            titleInput.remove();
            titleCell.textContent = title.trim();
            document.getElementById("itemName").focus();
        } else {
            console.warn(`Can't enter a blank list title!`);
            titleInput.focus();
        }
    
    // Item input handling
    } else if (event.target.id === "itemName") {
        const table = document.getElementById("checklistTable1");
        const itemInput = event.target;
        const item = itemInput.value;

        if (item) {
            const somethingIllChange = event.target;
            const row = somethingIllChange.closest('tr');
            const itemCell = row.cells[0];
            itemInput.remove();
            itemCell.textContent = item.trim();
            addEdit(table, itemCell);
            addDelete(table, itemCell);
            rowBuilder();
            document.getElementById("itemName").focus();
        } else {
            console.warn(`Can't enter blank line!`);
            itemInput.focus();
        }
    }
}

// Builds new row with input field and buttons
function rowBuilder() {
    const table = document.getElementById("checklistTable1");
    const newRow = table.insertRow(-1);

    // Build item cell with input field
    let itemCell = newRow.insertCell(0);
    itemCell.classList.add("col1");
    let newParagraph = document.createElement("p");
    newParagraph.id = `p${table.rows.length - 1}`;
    itemCell.appendChild(newParagraph);
    let newInput = document.createElement("input");
    newInput.type = "text";
    newInput.name = "itemName";
    newInput.id = "itemName";
    newInput.placeholder = `Item${table.rows.length - 1}`;
    itemCell.appendChild(newInput);

    // Build checkbox cell with single checkbox
    let checkCell = newRow.insertCell(1);
    checkCell.classList.add("col2");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    checkbox.id = "checkbox0";
    checkCell.appendChild(checkbox);

    // Add buttons
    addCheck(table, checkCell);
    addRmv(table, checkCell);
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
        const table = document.getElementById("checklistTable1");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
        rowBuilder();
        document.getElementById("checkTitle").focus();
    } else {

        // For genListSize()
        const table = document.getElementById("checklistTable1");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    }
}

// Generates blank, printable checklist based on Template Builder form values
function genListSize(table, numRows, checksPerRow, templateTitle) {
    const tBody = document.getElementById('tBody1');
    const titleCell = document.getElementById("th1");
    titleCell.textContent = templateTitle;
    const numChecks = document.getElementById("checkboxesPerRow").value;
    if (checksPerRow < 1) {
        document.getElementById("checkboxesPerRow").focus();
        return;
    }
    clearTable();

    // Row generation
    for (let i = 0; i < numRows; i++) {
        const tBody = table.getElementsByTagName('tbody')[0];
        const newRow = tBody.insertRow(-1);
        let itemCell = newRow.insertCell(0);
        itemCell.classList.add("col1");
        let newParagraph = document.createElement("p");
        newParagraph.id = `p${table.rows.length - 1}`;
        itemCell.appendChild(newParagraph);
        let checkCell = newRow.insertCell(1);
        checkCell.classList.add("col2");
        
        // Checkbox generation
        for (let j = 0; j < checksPerRow; j++) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            checkbox.id = `checkbox${j}`;
            checkCell.appendChild(checkbox);
        }
    }
}


/*------------------------------

        *Import/Export*

------------------------------*/


// Exports table data as JSON file
function exportChecklist() {
    const table = document.getElementById("checklistTable1");
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
            const table = document.getElementById("tBody1");
            const titleCell = document.getElementById("th1");
            titleCell.textContent = data.title;
            clearTable();
            
            // Populate table with imported data
            for (const item of data.items) {

                // Add new row and item text
                const row = table.insertRow();
                const itemCell = row.insertCell(0);
                itemCell.textContent = item.item;
                itemCell.style.textAlign = "center";

                // Add checkboxes
                const checkCell = row.insertCell(1);
                if (!item.checkEnum || item.checkEnum < 1) {
                    item.checkEnum = 1;
                }
                for (let i = 0; i < item.checkEnum; i++) {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.classList.add("checkbox");
                    checkbox.id = `checkbox${i}`;
                    checkCell.appendChild(checkbox);
                    checkCell.style.textAlign = "center";
                }

                // Add buttons
                addEdit(table, itemCell);
                addDelete(table, itemCell);
                addCheck(table, checkCell);
                addRmv(table, checkCell);
            }
            rowBuilder();   // Add blank row back to table after import
        };
        reader.readAsText(file);
    };
    input.click();
}

// Saves table as PNG image
function saveAsPng() {
    const table = document.getElementById("checklistTable1");
    const titleCell = document.getElementById("th1");
    const title = titleCell.textContent || "checklist";
    const lastRow = table.rows.length - 1;
    table.deleteRow(lastRow);
    document.querySelectorAll(".editButton").forEach(button => button.style.visibility = "hidden");
    document.querySelectorAll(".deleteButton").forEach(button => button.style.visibility = "hidden");
    document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "hidden");
    document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "hidden");
    html2canvas(table).then(canvas => {
        const link = document.createElement("a");
        link.download = `checklist-${title}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
    document.querySelectorAll(".editButton").forEach(button => button.style.visibility = "visible");
    document.querySelectorAll(".deleteButton").forEach(button => button.style.visibility = "visible");
    document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "visible");
    document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "visible");
    rowBuilder();
}


/*------------------------------

        *Button funcs*

------------------------------*/


// Build an edit button and append to table
function addEdit(table, itemCell) {
    let editButton = document.createElement("input");
    editButton.type = "button";
    editButton.value = "Edit";
    editButton.classList.add("editButton");
    editButton.id = `btnEdit${table.rows.length - 1}`;
    editButton.addEventListener("click", editItem);
    itemCell.appendChild(editButton);
}

// Replaces item input field and focuses it when "Edit" button is clicked
function editItem() {
    const table = document.getElementById("checklistTable1");
    const button = event.target;
    const row = button.closest('tr');
    const itemCell = row.cells[0];
    let itemText = itemCell.textContent;
    if (row) {
        itemCell.textContent = "";
        let editInput = document.createElement("input");
        editInput.type = "text";
        editInput.name = "editItem";
        editInput.id = "editItem";
        editInput.value = itemText;
        itemCell.appendChild(editInput);
        editInput.focus();

        // Adds event listener for Enter key on edit input field
        editInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const newItem = editInput.value;
                itemCell.textContent = newItem;
                addEdit(table, itemCell);
                addDelete(table, itemCell);
                document.getElementById("itemName").focus();
            }
        });
    } else {
        document.getElementById("itemName").focus();
    }
}

// Build a delete button and append to table
function addDelete(table, itemCell) {
    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = "Delete";
    deleteButton.classList.add("deleteButton");
    deleteButton.id = `btnDelete${table.rows.length - 1}`;
    deleteButton.addEventListener("click", deleteItem);
    itemCell.appendChild(deleteButton);
}

// Deletes row of clicked "Delete" button
function deleteItem() {
    const table = document.getElementById("checklistTable1");
    const button = event.target;
    const row = button.closest('tr');
    if (row) {
        row.remove();
    }
}

// Build a "+" button and append to table
function addCheck(table, checkCell) {
    let addButton = document.createElement("input");
    addButton.type = "button";
    addButton.value = "+";
    addButton.classList.add("addButton");
    addButton.addEventListener("click", addBox);
    addButton.id = `btnAdd${table.rows.length - 1}`;
    checkCell.appendChild(addButton);
}

// Adds checkbox to row of clicked "+" button
function addBox() {
    const table = document.getElementById("checklistTable1");
    const lastRow = table.rows.length - 1;
    const button = event.target;
    const row = button.closest('tr');
    const cell2 = row.cells[1];
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox");
    checkbox.id = `checkbox${cell2.querySelectorAll(".checkbox").length}`;
    cell2.appendChild(checkbox);
}

// Build a "-" button and append to table
function addRmv(table, checkCell) {
    let removeButton = document.createElement("input");
    removeButton.type = "button";
    removeButton.value = "-";
    removeButton.classList.add("removeButton");
    removeButton.addEventListener("click", removeBox);
    removeButton.id = `btnRemove${table.rows.length - 1}`;
    checkCell.appendChild(removeButton);
}

// Removes last checkbox from row of clicked "-" button
function removeBox() {
    const table = document.getElementById("checklistTable1");
    const lastRow = table.rows.length - 1;
    const button = event.target;
    const row = button.closest('tr');
    const cell2 = row.cells[1];
    const checkboxes = cell2.querySelectorAll(".checkbox");
    if (checkboxes.length > 1) {
        const lastCheckbox = checkboxes[checkboxes.length - 1];
        cell2.removeChild(lastCheckbox);
    }
}


/*------------------------------

        *Print Cleanup*

------------------------------*/


// Checks if we need to build a new tables for multi-page prints
function pageCheck() {
    const table = document.getElementById("checklistTable1");
    const titleCell = document.getElementById("th1");
    const title = titleCell.textContent
    const firstRow = table.rows[1];
    const firstCell = firstRow.cells[0];
    let pageCounter = 0;
    let pageLength = 0;
    let  template = false;

    if (firstCell.textContent === "") {
        pageLength = 21;
        template = true;
    } else if (firstCell.textCell !== "") {
        pageLength = 26;
    }
    pageCounter = Math.ceil((table.rows.length -1) / pageLength);

    if (pageCounter > 1) {
        if (template) {
            multiPageBuild(pageCounter, pageLength, template);
        } else {
            multiPageBuild(pageCounter, pageLength);
        }
    } else {
        
        // Remove last row if it contains the item input field
        const table = document.getElementById("checklistTable1");
        const lastRow = table.rows.length - 1;
        if (table.contains(document.getElementById(`itemName`))) {
            table.deleteRow(lastRow);
        }
        
        // Hide buttons
        document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "hidden");
        document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "hidden");
        document.querySelectorAll(".editButton").forEach(button => button.style.visibility = "hidden");
        document.querySelectorAll(".deleteButton").forEach(button => button.style.visibility = "hidden");
    }
}

// Creates new tables for multi-page prints
function multiPageBuild(pageCounter, pageLength, template) {
    const mainTable = document.getElementById("checklistTable1");
    const titleCell = document.getElementById("th1");
    const title = titleCell.textContent;

    // Builds array of rows and thier data
    const allRows = mainTable.rows.length;
    const rowData = [];
    for (let i = 1; i < allRows; i++) {
        const row = mainTable.rows[i];
        const textCell = row.cells[0];
        const checkCell = row.cells[1];
        const item = textCell.textContent;
        const checkboxes = checkCell.querySelectorAll(".checkbox");
        const checkEnum = checkboxes.length;
        rowData.push({ item, checkEnum });
    }
    clearTable();
    
    // Starts table building iterations
    for (let j = 0; j < pageCounter; j++) {
        
        // Makes sure the last table is created
        let tableLength = 0;
        if (rowData.length >= pageLength) {
            tableLength = pageLength;
        } else {
            tableLength = rowData.length;
        }
        if (rowData.length === 0) {
            return;
        }

        // Resets title for original table
        if (j === 0) {
            titleCell.textContent = `${title} (${j + 1}/${pageCounter})`;
        } else {

            // Builds table header
            let newTable = document.createElement('table');
            newTable.id = `checklistTable${j + 1}`;
            newTable.className = 'table';
            const tHead = document.createElement('thead');
            const tHeadRow = document.createElement('tr');
            const th = document.createElement('th');
            let h2 = document.createElement('h2');
            h2.id = `th${j + 1}`;
            h2.textContent = `${title} (${j + 1}/${pageCounter})`;
            let newTBody = document.createElement('tbody');
            newTBody.id = `tBody${j + 1}`;
            newTable.appendChild(newTBody);
            th.appendChild(h2);
            tHeadRow.appendChild(th);
            tHead.appendChild(tHeadRow);
            newTable.insertBefore(tHead, newTBody);
            const controlButtonDiv = document.getElementById(`controlBtnContainer`);
            document.body.insertBefore(newTable, controlButtonDiv);
            tHeadRow.insertCell(1);
        }

        // Fills out table
        for (let k = 0; k < tableLength - 1; k++) {
            const table = document.getElementById(`tBody${j + 1}`);
            let newRow = table.insertRow(-1);
            let itemCell = newRow.insertCell(0);
            itemCell.classList.add("col1");
            let newParagraph = document.createElement("p");
            newParagraph.id = `p${table.rows.length}_${j +1}`;
            newParagraph.textContent = rowData[k].item;
            itemCell.appendChild(newParagraph);
            itemCell.style.textAlign = "center";
            let checkCell = newRow.insertCell(1);
            checkCell.classList.add("col2");
            
            // Add checkboxes
            if (!rowData[k].checkEnum || rowData[k].checkEnum < 1) {
                rowData[k].checkEnum = 1;
            }
            for (let l = 0; l < rowData[k].checkEnum; l++) {
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.classList.add("checkbox");
                checkbox.id = `checkbox${l}`;
                checkCell.appendChild(checkbox);
                checkCell.style.textAlign = "center";
            }

            
            if (template) {
                newRow.style.height = "40px";
            }
        }

        // Removes newly created table row data from array
        if (j === 0) {
            for (let m = 0; m < tableLength; m++) {
                rowData.shift();
            }
        }
    }
}

// Tears down multi-page printing layout and returns to default
function multiPageUndo(template) {
    const tables = document.querySelectorAll('table');
    const tablesEnum = tables.length;
    const rowData = [];
    for (let i = 0; i < tablesEnum; i++) {

        // Builds array of rows and thier data
        const table = document.getElementById(`checklistTable${i + 1}`);

        if (table.id === "checklistTable1" && !template) {
            // Add buttons back to original table
            for (let j = 0; j < table.rows.length -1; j++) {
                const row = table.rows[j + 1];
                const itemCell = row.cells[0];
                const checkCell = row.cells[1];
                addEdit(table, itemCell);
                addDelete(table, itemCell);
                addCheck(table, checkCell);
                addRmv(table, checkCell);
            }
            table.deleteRow(table.rows.length - 1);
        }

        if (table.id !== `checklistTable1`) {
            const allRows = table.rows.length;
            for (let i = 0; i < allRows - 1; i++) {
                const row = table.rows[i + 1];
                const itemCell = row.cells[0];
                const item = itemCell.textContent;
                const checkCell = row.cells[1];
                const checks = checkCell.querySelectorAll(".checkbox");
                const checkEnum = checks.length;
                rowData.push({ item, checkEnum });
            }
            table.remove();
        }
    }
    
    // Fills out table
    const table = document.getElementById(`checklistTable1`);
    const tBody = table.querySelector('tbody');
    const titleCell = document.getElementById(`th1`);
    const title = titleCell.textContent.split(" ", 1);
    titleCell.innerText = title;
    for (let k = 0; k < rowData.length; k++) {
        let newRow = table.insertRow(-1);
        let itemCell = newRow.insertCell(0);
        itemCell.classList.add("col1");
        let newParagraph = document.createElement("p");
        newParagraph.id = `p${table.length + k + 1}`;
        newParagraph.textContent = rowData[k].item;
        itemCell.appendChild(newParagraph);
        let checkCell = newRow.insertCell(1);
        checkCell.classList.add("col2");
        
        // Adds checkboxes
        for (let l = 0; l < rowData[k].checkEnum; l++) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            checkbox.id = `checkbox${l}`;
            checkCell.appendChild(checkbox);
            checkCell.style.textAlign = "center";
        }

        if (!template) {
            // Add buttons
            addEdit(table, itemCell);
            addDelete(table, itemCell);
            addCheck(table, checkCell);
            addRmv(table, checkCell);
        }
    }

    if (template) {
        const rows = table.querySelectorAll('tr');
        if (rows && !table.rows[0]) {
            newRow.style.height = '40px';
        }
    } else {
        rowBuilder();
    }
}