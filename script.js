const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');

const todos = [];

function renderTodos() {
    todoList.replaceChildren();

    todos.forEach((todo, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'todo-item';

        const todoLabel = document.createElement('label');
        todoLabel.className = 'todo-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', `Mark ${todo.text} as completed`);
        checkbox.addEventListener('change', () => {
            todo.completed = checkbox.checked;
            renderTodos();
        });

        const todoText = document.createElement('span');
        todoText.className = 'todo-text';
        if (todo.completed) {
            todoText.classList.add('is-complete');
        }
        todoText.textContent = todo.text;

        todoLabel.append(checkbox, todoText);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete ${todo.text}`);
        deleteButton.addEventListener('click', () => {
            todos.splice(index, 1);
            renderTodos();
        });

        listItem.append(todoLabel, deleteButton);
        todoList.append(listItem);
    });

    emptyState.classList.toggle('is-hidden', todos.length > 0);
}

todoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const value = todoInput.value.trim();
    if (!value) {
        todoInput.focus();
        return;
    }

    todos.push({ text: value, completed: false });
    todoInput.value = '';
    todoInput.focus();
    renderTodos();
});

renderTodos();