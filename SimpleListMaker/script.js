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

// Builds new row with input field and buttons
function rowBuilder() {
    const table = document.getElementById("listTable1");
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
    editButton.id = `btnEdit${table.rows.length - 1}`;
    editButton.addEventListener("click", editItem);
    cell1.appendChild(editButton);

    // Build delete button
    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = "Delete";
    deleteButton.classList.add("deleteButton");
    deleteButton.id = `btnDelete${table.rows.length - 1}`;
    deleteButton.addEventListener("click", deleteItem);
    cell1.appendChild(deleteButton);
}

// Changes the way the Enter key behaves, and cleans up prints
function formControl() {
    document.getElementById("listTitle").focus(); // Focus first input field on page load

    // Cleans up table for printing
    window.addEventListener("beforeprint", function() {

        // Remove last row if it contains the item input field
        const table = document.getElementById("listTable1");
        const lastRow = table.rows.length - 1;
        if (table.contains(document.getElementById(`itemName`))) {
            table.deleteRow(lastRow);
        }

        // Hide buttons
        pageCheck();
        document.querySelectorAll(".addButton").forEach(button => button.style.visibility = "hidden");
        document.querySelectorAll(".removeButton").forEach(button => button.style.visibility = "hidden");
    });

    // Adds removed row back to table, and shows buttons
    window.addEventListener("afterprint", function() {
        multiPageUndo();
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
            const numRows = document.getElementById("numRows");
            const templateTitle = document.getElementById("templateTitle");
            if (document.activeElement.id === "numRows" && !templateTitle.value) {
                document.getElementById("templateTitle").focus();
            }
            if (document.activeElement.id === "templateTitle" && document.activeElement.value && numRows.value) {
                genListSize();
            }
        }
    });
}

// Checks if we need to build a new tables for multi-page prints
function pageCheck() {
    const table = document.getElementById("listTable1");
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

    if (pageCounter > 0) {
        multiPageBuild(pageCounter, pageLength, template)
    }
}

// Creates new tables for multi-page prints
function multiPageBuild(pageCounter, pageLength, template) {
    const mainTable = document.getElementById("listTable1");
    const titleCell = document.getElementById("th1");
    const title = titleCell.textContent;

    // Builds array of rows and thier data
    const allRows = mainTable.rows.length;
    const rowData = [];
    for (let i = 1; i < allRows; i++) {
        const row = mainTable.rows[i];
        const textCell = row.cells[0];
        rowData.push(textCell.textContent);
    }

    clearTable();
    
    for (let j = 0; j < pageCounter; j++) {
        let tableLength = 0;
        if (rowData.length >= pageLength) {
            tableLength = pageLength;
        } else {
            tableLength = rowData.length;
        }
        console.log(tableLength);
        if (rowData.length === 0) {
            return;
        }
        if (j === 0) {
            titleCell.textContent = `${title} (${j + 1}/${pageCounter})`;
        } else {

            // Builds table header
            let newTable = document.createElement('table');
            newTable.id = `listTable${j + 1}`;
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
        }

        // Fills out table
        for (let k = 0; k < tableLength; k++) {
            const table = document.getElementById(`tBody${j + 1}`);
            let newRow = table.insertRow(-1);
            if (template) {
                newRow.style.height = "40px";
            }
            let cell1 = newRow.insertCell(0);
            cell1.classList.add("col1");
            let newParagraph = document.createElement("p");
            newParagraph.id = `p${table.rows.length}_${j +1}`;
            newParagraph.textContent = rowData.shift();
            cell1.appendChild(newParagraph);
        }
    }
}

// Tears down multi-page printing layout and returns to default
function multiPageUndo() {
    const tables = document.querySelectorAll('table');
    const tablesEnum = tables.length;
    const rowData = [];
    for (let i = 0; i < tablesEnum; i++) {

        // Builds array of rows and thier data
        const table = document.getElementById(`listTable${i + 1}`);
        if (table.id !== `listTable1`) {
            const allRows = table.rows.length;
            for (let i = 0; i < allRows - 1; i++) {
                const row = table.rows[i + 1];
                rowData.push(row.innerText);
                console.log(rowData[i]);
            }
            table.remove();
        }
    }
    
    // Fills out table
    const table = document.getElementById(`tBody1`);
    const titleCell = document.getElementById(`th1`);
    const title = titleCell.textContent.split(" ", 1);
    titleCell.innerText = title;
    for (let j = 0; j < rowData.length; j++) {
        console.log(`Appending item '${rowData[j]}' ${j + 1}/${rowData.length}`);
        const newRow = table.insertRow(-1);
        let cell1 = newRow.insertCell(0);
        cell1.classList.add("col1");
        let newParagraph = document.createElement("p");
        newParagraph.id = `p${table.length}`;
        newParagraph.textContent = rowData[j];
        cell1.appendChild(newParagraph);
    }
}

// Replaces item input field and focuses it when "Edit" button is clicked
function editItem() {
    const table = document.getElementById("listTable1");
    const lastRow = table.rows.length - 1;
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btnEdit", ""));
    const row = table.rows[rowIndex];
    const cell1 = row.cells[0];
    let itemText = cell1.textContent;
    if (rowIndex !== lastRow) {
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
                const deleteButton = document.createElement("input");
                deleteButton.type = "button";
                deleteButton.value = "Delete";
                deleteButton.classList.add("deleteButton");
                deleteButton.id = `btnDelete${rowIndex}`;
                deleteButton.addEventListener("click", deleteItem);
                cell1.appendChild(deleteButton);
                table.deleteRow(lastRow);
                rowBuilder();
                document.getElementById("itemName").focus();
            }
        });
    } else {
        document.getElementById("itemName").focus();
    }
}

// Deletes row of clicked "Delete" button
function deleteItem() {
    const table = document.getElementById("listTable1");
    const lastRow = table.rows.length - 1;
    const buttonId = event.target.id;
    const rowIndex = parseInt(buttonId.replace("btnDelete", ""));
    if (rowIndex !== lastRow) {
        table.deleteRow(rowIndex);
    }
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
        const table = document.getElementById("listTable1");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
        rowBuilder();
        document.getElementById("listTitle").focus();
    } else {

        // For genListSize()
        const table = document.getElementById("listTable1");
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    }
}

// Generates blank, printable checklist based on Template Builder form values
function genListSize() {
    const table = document.getElementById("listTable1");
    const tBody = document.getElementById("tBody1");
    const numRows = document.getElementById("numRows").value;
    const title = document.getElementById("templateTitle").value;
    const titleCell = document.getElementById("th1");
    clearTable();
    titleCell.textContent = title;

    // Row generation
    for (let i = 0; i < numRows; i++) {
        const tBody = table.getElementsByTagName("tbody")[0];
        const newRow = tBody.insertRow(-1);
        let cell1 = newRow.insertCell(0);
        cell1.classList.add("col1");
        let newParagraph = document.createElement("p");
        newParagraph.id = `p${table.rows.length - 1}`;
        cell1.appendChild(newParagraph);
    }
    rowBuilder();
}

// Handles writing to table
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
        const table = document.getElementById("listTable1");
        const itemInput = document.getElementById("itemName");
        const item = itemInput.value;
        const itemCell = document.getElementById(`p${table.rows.length - 1}`);
        const editButton = document.getElementById(`btnEdit${table.rows.length - 1}`);
        const deleteButton = document.getElementById(`btnDelete${table.rows.length - 1}`);
        itemInput.remove();
        itemCell.textContent = item;
        itemCell.appendChild(editButton);
        itemCell.appendChild(deleteButton);
        rowBuilder();
        document.getElementById("itemName").focus();
    }
}

// Exports table data as JSON file
function exportList() {
    const table = document.getElementById("listTable1");
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

                // Add edit button
                let editButton = document.createElement("input");
                editButton.type = "button";
                editButton.value = "Edit";
                editButton.classList.add("editButton");
                editButton.id = `btnEdit${table.rows.length - 1}`;
                editButton.addEventListener("click", editItem);
                itemCell.appendChild(editButton);
            }
            rowBuilder();   // Add blank row back to table after import
        };
        reader.readAsText(file);
    };
    input.click();
}

// Saves table as PNG image
function saveAsPng() {
    const table = document.getElementById("listTable1");
    const titleCell = document.getElementById("th1");
    const title = titleCell.textContent || "list";
    const lastRow = table.rows.length - 1;
    table.deleteRow(lastRow);
    document.querySelectorAll(".editButton").forEach(button => button.style.visibility = "hidden");
    html2canvas(table).then(canvas => {
        const link = document.createElement("a");
        link.download = `checklist-${title}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
    document.querySelectorAll(".editButton").forEach(button => button.style.visibility = "visible");
    rowBuilder();
}