// app.js — Task Manager with working subtasks + persistence

// Element refs
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Tasks data (top-level)
let tasks = loadFromStorage();

/** Task factory */
function createTask(title) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    completed: false,
    subtasks: []
  };
}

/** Storage helpers */
function saveToStorage() {
  localStorage.setItem('tasks_v1', JSON.stringify(tasks));
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem('tasks_v1');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse tasks from localStorage', e);
    return [];
  }
}

/** Render tasks recursively */
function renderTasks(list, parentEl) {
  parentEl.innerHTML = ''; // clear

  list.forEach((task, idx) => {
    // Task card
    const li = document.createElement('li');
    li.className = 'task-card';
    if (task.completed) li.classList.add('completed');

    // Header
    const header = document.createElement('div');
    header.className = 'task-header';

    // Left: checkbox + title
    const left = document.createElement('div');
    left.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = !!task.completed;
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveToStorage();
      renderTasks(tasks, taskList);
    });

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    left.appendChild(checkbox);
    left.appendChild(title);

    // Buttons group
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      const newVal = prompt('Edit task title', task.title);
      if (newVal !== null) {
        const trimmed = newVal.trim();
        if (trimmed) {
          task.title = trimmed;
          saveToStorage();
          renderTasks(tasks, taskList);
        }
      }
    });

    const addSubBtn = document.createElement('button');
    addSubBtn.className = 'btn btn-add-sub';
    addSubBtn.textContent = 'Add Subtask';

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-delete';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      // remove from current list (works for nested lists because 'list' is the current parent array)
      list.splice(idx, 1);
      saveToStorage();
      renderTasks(tasks, taskList);
    });

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(addSubBtn);
    btnGroup.appendChild(delBtn);

    header.appendChild(left);
    header.appendChild(btnGroup);

    // Subtask area
    const subContainer = document.createElement('div');
    subContainer.className = 'subtask-container';

    // Subtask input row (hidden by default)
    const subInputRow = document.createElement('div');
    subInputRow.className = 'subtask-input';
    subInputRow.style.display = 'none'; // hidden initially

    const subInput = document.createElement('input');
    subInput.type = 'text';
    subInput.placeholder = 'New subtask...';

    const subAdd = document.createElement('button');
    subAdd.className = 'btn';
    subAdd.textContent = 'Add';

    subInputRow.appendChild(subInput);
    subInputRow.appendChild(subAdd);

    // Subtask list (where nested items render)
    const subUl = document.createElement('ul');
    subUl.className = 'subtask-list';

    // toggle input visibility on Add Subtask click
    addSubBtn.addEventListener('click', () => {
      if (subInputRow.style.display === 'none' || subInputRow.style.display === '') {
        subInputRow.style.display = 'flex';
        subInput.focus();
      } else {
        subInputRow.style.display = 'none';
      }
    });

    // Add subtask handler
    subAdd.addEventListener('click', () => {
      const txt = subInput.value.trim();
      if (!txt) return;
      task.subtasks.push(createTask(txt));
      saveToStorage();
      renderTasks(tasks, taskList); // re-render full tree
    });

    // press Enter to add subtask fast
    subInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') subAdd.click();
    });

    // Recursively render subtasks (if any)
    if (task.subtasks && task.subtasks.length) {
      renderTasks(task.subtasks, subUl);
    }

    subContainer.appendChild(subInputRow);
    subContainer.appendChild(subUl);

    li.appendChild(header);
    li.appendChild(subContainer);
    parentEl.appendChild(li);
  });
}

/** Add top-level task */
function addTopTask() {
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }
  tasks.push(createTask(title));
  taskInput.value = '';
  saveToStorage();
  renderTasks(tasks, taskList);
}

// event bindings
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTopTask();
});
addTaskBtn.addEventListener('click', addTopTask);

// initial render
renderTasks(tasks, taskList);
