// declaring variables that select specific HTML elements
const todoForm = document.querySelector(".todo_form");
const todoItems = document.querySelector(".todo-items");
const todoFooter = document.querySelector(".todo-footer");
const clearCompleted = document.querySelector(".clear-completed");
const footerMenus = document.querySelectorAll(".footer-menus li");

// tasks is an empty array that will store to-do list items
let tasks = [],
    // filteredTasks is an empty array that will store a filtered version of the to-do list items based on whether they are completed or not
    filteredTasks = [],
    // isShowAllTasks is a boolean variable initially set to true, indicating that all the tasks will be displayed
    isShowAllTasks = true;


// The handleSubmit() function is executed when the user submits the form to add a new to-do item.
const handleSubmit = (e) => {
    // It first prevents the default form submission behavior.
    e.preventDefault();

    // if the form input field is empty, the function returns and does not execute any further code.
    if (!e.target.add_todo.value) return;

    //getting the value of the hidden input field with the name "hidden_item" and converts it to an integer.
    const existingItemId = parseInt(e.target.hidden_item.value);

    // if there is a hidden input field with a value, it means that the user clicked on an existing to-do item to edit it.
    if (e.target.hidden_item.value) {

        // Clicked  item / Object
        // finding the task with the ID that matches the value of the hidden input field.
        const editedItem = tasks.find((item) => item.id === existingItemId);

        // finding the index of the task with the ID that matches the value of the hidden input field.
        const index = tasks.findIndex((item) => item.id === existingItemId);

        // creating a new array of tasks with the edited task replaced with a new task that has the updated task name.
        const newTasks = [...tasks.slice(0, index), { ...editedItem, task: e.target.add_todo.value }, ...tasks.slice(index + 1)];

        // assigning the new array of tasks to the tasks variable.
        tasks = newTasks;

        // resets the form 
        todoForm.reset();

        //dispatches a custom event to update the display of the to-do list.
        todoItems.dispatchEvent(new CustomEvent("updateTask"));

        return;
    }

    // defining a new task object with an ID, task name, and completion status.
    const item = {
        id: Date.now(),
        task: e.target.add_todo.value,
        isCompleted: false,
    };

    //adding the new task to the beginning of the tasks array.
    tasks.unshift(item);

    // resets the form
    todoForm.reset();

    // dispatches a custom event called "updateTask" to the todoItems element.
    todoItems.dispatchEvent(new CustomEvent("updateTask"));

    // to display or hide the footer depending on whether there are any tasks.
    displayFooterIfHaveTasks();
};

// generating HTML code for displaying the to-do list items. It checks if all tasks should be shown or only filtered tasks, and generates HTML code for each task item.
const displayTasks = () => {

    // initializing an empty string called html.
    let html = "";

    //checks if the isShowAllTasks variable is true, indicating that all tasks should be displayed.
    if (isShowAllTasks) {

        //mapping each task in the tasks array to an HTML list item using a function called listItem, and then joins the resulting array of HTML strings into a single string.
        html = tasks.map((item) => listItem(item)).join("");

    }

    //executed if isShowAllTasks is false, indicating that only completed or incomplete tasks should be displayed.
    else {

        //mapping each task in the filteredTasks array to an HTML list item using a function called listItem, and then joins the resulting array of HTML strings into a single string.
        html = filteredTasks.map((item) => listItem(item)).join("");
    }

    // setting the innerHTML property of the todoItems element to the html string.
    todoItems.innerHTML = html;
};

//defining a function called listItem that takes a task object as an argument and returns an HTML string for the task list item.
function listItem(item) {

    return `<li>
  <label id="${item.id}" class="todo-left ${item.isCompleted && "completed"}" for="item-${item.id}">
    <input type="checkbox" id="item-${item.id}" ${item.isCompleted && "checked"} value="${item.id}" />
    ${item.task}
  </label>

  <div class="todo-right">
  <button type="button" class="edit" value="${item.id}">
  ${editIcon()}
</button>
<button type="button" class="delete" value="${item.id}">
  ${closeIcon()}
</button>
  </div>
</li>`;
}

// saving tasks array to local storage as a JSON string.
function saveTasksIntoLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

//retrieving the tasks array from local storage and updates the task list display if there are saved tasks.
function displayTasksFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem("tasks"));

    if (Array.isArray(savedData) && savedData.length > 0) {
        // tasks = savedData;
        // savedData.forEach((item) => tasks.push(item));
        tasks.push(...savedData);

        todoItems.dispatchEvent(new CustomEvent("updateTask"));
    }

    displayFooterIfHaveTasks();
}

// displays or hides the task list footer, and updates the count of incomplete tasks.
function displayFooterIfHaveTasks() {
    if (tasks.length === 0) {
        todoFooter.style.display = "none";
    } else {
        todoFooter.style.display = "flex";
    }

    const incompletedTasks = tasks.filter((item) => !item.isCompleted).length;

    countLeftItems(incompletedTasks);
}

// update the count of incomplete tasks in the task list footer.
function countLeftItems(totalItems = 2) {
    const leftItems = document.querySelector(".left-items");

    const count = totalItems > 1 ? `${totalItems} Items Left` : `${totalItems} Item Left`;
    leftItems.innerHTML = count;
}

// called when the user clicks the "Clear Completed" button. It removes all completed tasks from the tasks array and dispatches a custom event to update the task list display.
function clearCompletedTasks(e) {
    const countCompletedTask = tasks.filter((item) => item.isCompleted);
    if (countCompletedTask.length === 0) return;

    const countInCompletedTask = tasks.filter((item) => !item.isCompleted);

    tasks = countInCompletedTask;
    displayFooterIfHaveTasks();
    todoItems.dispatchEvent(new CustomEvent("updateTask"));
}

//toggle the "isCompleted" property of a task object and dispatches a custom event to update the task list display.
function completeTask(id) {
    const clickedItem = tasks.find((item) => item.id === id);
    clickedItem.isCompleted = !clickedItem.isCompleted;
    todoItems.dispatchEvent(new CustomEvent("updateTask"));

    // filter left items
    const incompletedTasks = tasks.filter((item) => !item.isCompleted).length;

    countLeftItems(incompletedTasks);
}

//remove a task object with a specific id from the tasks array and dispatches a custom event to update the task list display.
function deleteTask(id) {
    const deletedItem = tasks.filter((item) => item.id !== id);
    tasks = deletedItem;
    todoItems.dispatchEvent(new CustomEvent("updateTask"));
    displayFooterIfHaveTasks();
}

//update the input field value with the task name and sets the hidden field value with the task id. This function is called when the user clicks the "Edit" button for a task.
function editTask(id) {
    const existingItem = tasks.find((item) => item.id === id);
    todoForm.querySelector("input").value = existingItem.task;
    todoForm.querySelector("[name='hidden_item']").value = existingItem.id;
}


//called when the user clicks on one of the filter menu items. It updates the isShowAllTasks variable based on the selected filter and dispatches a custom event to update the task list display.
function filterMenus(e) {
    // remove selected class from all li's
    footerMenus.forEach((menu) => menu.classList.remove("selected"));

    // Add selectd class on clicked li
    const classList = e.target.classList;
    classList.add("selected");

    if (classList.contains("all")) {
        isShowAllTasks = true;

        todoItems.dispatchEvent(new CustomEvent("updateTask"));
    } else if (classList.contains("active")) {
        isShowAllTasks = false;
        const clonedArray = [...tasks];

        const newTasks = clonedArray.filter((task) => !task.isCompleted);
        filteredTasks = newTasks;

        todoItems.dispatchEvent(new CustomEvent("updateTask"));
    } else if (classList.contains("completed")) {
        isShowAllTasks = false;
        const clonedArray = [...tasks];

        const newTasks = clonedArray.filter((task) => task.isCompleted);
        filteredTasks = newTasks;

        todoItems.dispatchEvent(new CustomEvent("updateTask"));
    }
}

// Event listeners
// These lines set up event listeners for different actions that can be performed in the application
todoForm.addEventListener("submit", handleSubmit);
todoItems.addEventListener("updateTask", displayTasks);
todoItems.addEventListener("updateTask", saveTasksIntoLocalStorage);
clearCompleted.addEventListener("click", clearCompletedTasks);

footerMenus.forEach((menu) => menu.addEventListener("click", filterMenus));

todoItems.addEventListener("click", (e) => {
    const id = parseInt(e.target.id) || parseInt(e.target.value);
    if (e.target.matches("label.todo-left") || e.target.matches("input")) {
        completeTask(id);
    }

    // Delete a specific item from the array
    if (e.target.closest(".delete")) {
        deleteTask(parseInt(e.target.closest(".delete").value));
    }

    // Edit task
    if (e.target.closest(".edit")) {
        editTask(parseInt(e.target.closest(".edit").value));
    }
});

//calling the displayTasksFromLocalStorage function when the page loads to display any saved tasks in the task list.
displayTasksFromLocalStorage();