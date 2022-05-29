
/* ----------------- TASK MANAGER ------------------ */
/* ------------------- FUNCTIONS ------------------- */

/**
 * Setup initial values to local storage.
 */
function initialValues() {
    if (localStorage.getItem("firstTaskAdded") === null) {
        localStorage.setItem("firstTaskAdded", "false");
    }
    if (localStorage.getItem("id") === null) {
        localStorage.setItem("id", JSON.stringify(2));
    }
}

/**
 * Reads text input value and creates a task.
 * @param text_input input element containing text as value
 */
function readValueAndAddTask(text_input) {
    if (text_input.value.trim() === '') {
        text_input.value = '';
        return;
    }

    // Get id from localStorage
    let number = localStorage.getItem("id");
    number = JSON.parse(number);

    // Create task
    const task = {
        id: number,
        text: escape(text_input.value.trim()),
        done: false
    };
    tasks.addTask(task);

    // Update id count
    localStorage.setItem("id", JSON.stringify(number+1));

    // Update list
    createTasks(true);
    createTasks(false);

    // Clear text input
    text_input.value = '';
}

/**
 * Escape tags.
 * @param string string to escape
 * @returns {*} escaped string
 */
function escape(string) {
    return string.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Default data for task list
 */
function getDefaultData() {
    const defaultData = [];
    const task1 = {
        id: 0,
        text: 'Vzorový aktivní úkol',
        done: false
    };
    const task2 = {
        id: 1,
        text: 'Vzorový dokončený úkol',
        done: true
    };
    defaultData.push(task1);
    defaultData.push(task2);
    return defaultData;
}

/**
 * Creates list item tasks from loaded tasks.
 * @param active true=active tasks, false=completed tasks
 */
function createTasks(active) {
    let resultTasks;
    let target_element;

    if (active) {
        // Get Active tasks
        resultTasks = tasks.getActiveTasks();

        // Find Active task list
        target_element = document.getElementById('active-tasks')
    } else {
        // Get Finished tasks
        resultTasks = tasks.getFinishedTasks();

        // Find Finished task list
        target_element = document.getElementById('finished-tasks')
    }
    if (target_element != null) {
        target_element.innerHTML = ''
    }

    let input;
    let button;

    for (let i = 0; i < resultTasks.length; i++) {
        const task = resultTasks[i];

        // Create elements
        const label = document.createElement('label');
        label.innerHTML = task.text;

        input = document.createElement('input');
        input.type = 'checkbox';

        if (active) {
            input.addEventListener('change', (e) => {

                tasks.finishTask(e.target.parentElement.id);

                // Update lists
                createTasks(true);
                createTasks(false);
            })

            button = document.createElement('button');
            button.classList.add("delete-button");
            button.addEventListener('click', (e) => {

                tasks.removeTask(e.target.parentElement.id);

                // Update list
                createTasks(true);
            })
        } else { // completed task
            input.setAttribute("checked", "");
            input.setAttribute("disabled", "");
        }

        // Pack elements into <li> tag
        const list_item = document.createElement('li');
        list_item.appendChild(input);
        list_item.appendChild(label);
        if (active) {
            list_item.appendChild(button);
        }
        // assign id
        list_item.setAttribute('id', task.id)

        // Add task to the list
        target_element.appendChild(list_item);
    }
}

/* ---------------- TASKS PROTOTYPE INHERITANCE ---------------- */

let Tasks = function (defaultTasks) {
    this._tasks = defaultTasks;
}
    /**
     * Add a new task.
     * @param task Task as an object.
     */
    Tasks.prototype.addTask = function (task) {
        if (localStorage.getItem("firstTaskAdded") === "false") {
            this._tasks = [];
            localStorage.setItem("firstTaskAdded", "true");
        }
        this._tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(this._tasks));
    }

    /**
     * Set task as done.
     * @param id id of the <li> element to be set as done.
     */
    Tasks.prototype.finishTask = function (id) {
        id = JSON.parse(id);
        for (let task of this._tasks) {
            if (task.id === id) {
                task.done = true;
                console.log("Task set as finished");
            }
        }
        localStorage.setItem("tasks", JSON.stringify(this._tasks));
    }

    /**
     * Remove one task by given name.
     */
    Tasks.prototype.removeTask = function (toDelete) {
        toDelete = JSON.parse(toDelete);
        localStorage.setItem("firstDeleted", "false");

        this._tasks = this._tasks.filter(function(task) {

            if (localStorage.getItem("firstDeleted") === "true") {
                return true;
            }
            if (task.id === toDelete) {
                localStorage.setItem("firstDeleted", "true");
                console.log("Task set as removed");
                return false;
            }
            return true;
        });
        localStorage.setItem("tasks", JSON.stringify(this._tasks));
    }

    Tasks.prototype.getActiveTasks = function () {
        return this._tasks.filter((task) => {
            return task.done === false;
        });
    }

    Tasks.prototype.getFinishedTasks = function () {
        return this._tasks.filter((task) => {
            return task.done === true;
        });
    }

/* ---------------- EVENT LISTENERS ---------------- */

/* Add task input event listener on click */
const button_input = document.getElementById('submit-button');
button_input.addEventListener('click', () => {
    readValueAndAddTask(document.getElementById('task-input'))
})

/* Add task by pressing Enter */
const task_input = document.getElementById('task-input');
task_input.addEventListener('keyup', (e) => {
    if (e.key !== "Enter") {
        return;
    }

    readValueAndAddTask(e.target);
})

/* Reset button - reset and clear tasks */
const reset_button = document.querySelector('main .reset-button');
reset_button.addEventListener('click', () => {
    localStorage.clear();
    tasks = new Tasks(getDefaultData());
    createTasks(true);
    createTasks(false);
    initialValues();
})

/* ------------------- Execute code on page reload ------------------ */

/* Load initial values */
initialValues();

/* Initialize tasks variable (from localStorage if possible) */
let tasks = null;
let localStorageTasks = localStorage.getItem("tasks");
if (localStorageTasks !== null) {
    localStorageTasks = JSON.parse(localStorageTasks);
    if (localStorageTasks.length !== 0) {
        tasks = new Tasks(localStorageTasks);
    }
}
if (tasks === null) {
    tasks = new Tasks(getDefaultData());
    localStorage.setItem("firstTaskAdded", "false");
}

// Create default data
const active = true;
createTasks(active);
createTasks(!active);


/* ------------------------------------------------------------------ */

/* --------------------- OFFLINE ALERT MENU ------------------------- */

/**
 * Offline detector.
 */
window.addEventListener('online', updateOnline);
window.addEventListener('offline', updateOnline);

function updateOnline() {
    const alert_element = document.querySelector(".alert");
    if (!navigator.onLine) {
        alert_element.classList.add('alert-visible');
    } else {
        alert_element.classList.remove('alert-visible');
    }
}

/* Alternative solution: */
/**
 * Offline detector.
 */
/*setInterval(async () => {
    const online = await checkOnline();
    const alert_element = document.querySelector(".alert");
    if (!online) {
        alert_element.classList.add('alert-visible');
    } else {
        alert_element.classList.remove('alert-visible');
    }
}, 3000);*/

/**
 * Async. download 1 pixel image to check if online.
 * @returns {Promise<boolean>} Result of time taken to download.
 */
/*const checkOnline = async () => {
    try {
        const online = await fetch("img/pixel.png");
        return online.status >= 100 && online.status < 400;
    } catch (e) {
        return false;
    }
};*/

/* ------------------------ SCALABLE BOX ---------------------------- */
const scalable_box = document.querySelector('.scalable-box');
scalable_box.addEventListener("mouseenter", (e) => {
    e.target.innerHTML = `Instrukce:<br>1. Zadej úkol.<br>2. Splň, nebo zruš úkol.<br>3. Resetuj úkoly.`;
}, false)

scalable_box.addEventListener("mouseleave", (e) => {
    e.target.innerHTML = "Zobrazit<br>Návod";
}, false)

/* ------------------------ HIDDEN RIGHT PANEL ---------------------------- */
const hidden_menu_button = document.getElementById('show-right-panel');

let menu_visible = false;
hidden_menu_button.addEventListener('click', () => {
    const right_panel = document.getElementById('right-panel');
    menu_visible = !menu_visible;
    if (menu_visible) {
        right_panel.classList.add('menu-visible');
    } else {
        right_panel.classList.remove('menu-visible');
    }
})

/* ---------------------------- AUDIO BUTTON ---------------------------- */
const sound_music = new Audio('media/summer_pop.mp3');

const audio_button = document.getElementById('audio-button');

let audio_playing = false;
audio_button.addEventListener('click', () => {
    audio_playing = !audio_playing;
    if (audio_playing) {
        sound_music.play();
    } else {
        sound_music.pause();
    }
})

/* ---------------------------- MODAL WINDOW ---------------------------- */
document.addEventListener("mouseleave", (e) => {
    if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        document.body.classList.add('modal-visible');
    }
});

const modal_button = document.getElementById('modal-button');

modal_button.addEventListener('click', () => {
    document.body.classList.remove('modal-visible');
})