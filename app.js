/**
 * TaskFlow - Aplicación de Gestión de Tareas (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- ESTADO GENERAL ---
  let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [
    {
      id: 1,
      title: 'Crear maqueta responsive en HTML y CSS',
      category: 'DAW',
      priority: 'Alta',
      dueDate: '2026-11-15',
      completed: true
    },
    {
      id: 2,
      title: 'Configurar base de datos para el proyecto',
      category: 'IT',
      priority: 'Media',
      dueDate: '2026-11-20',
      completed: false
    }
  ];

  let currentFilter = 'all';
  let searchQuery = '';

  // --- ELEMENTOS DEL DOM ---
  const taskForm = document.getElementById('taskForm');
  const taskTitle = document.getElementById('taskTitle');
  const taskCategory = document.getElementById('taskCategory');
  const taskPriority = document.getElementById('taskPriority');
  const taskDueDate = document.getElementById('taskDueDate');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterTabs = document.getElementById('filterTabs');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  // Métricas
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statCompleted = document.getElementById('statCompleted');
  const statPercent = document.getElementById('statPercent');
  const progressBar = document.getElementById('progressBar');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  // --- EVENT LISTENERS ---

  // Crear tarea
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now(),
      title: taskTitle.value.trim(),
      category: taskCategory.value,
      priority: taskPriority.value,
      dueDate: taskDueDate.value,
      completed: false
    };

    tasks.unshift(newTask);
    saveAndRender();
    taskForm.reset();
    showToast('Tarea agregada con éxito', 'success');
  });

  // Filtros de navegación
  filterTabs.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-tab')) return;

    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active-tab'));
    e.target.classList.add('active-tab');

    currentFilter = e.target.dataset.filter;
    renderTasks();
  });

  // Búsqueda en vivo
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderTasks();
  });

  // Eliminar completadas
  clearCompletedBtn.addEventListener('click', () => {
    const prevCount = tasks.length;
    tasks = tasks.filter(t => !t.completed);
    if (tasks.length < prevCount) {
      saveAndRender();
      showToast('Tareas completadas eliminadas', 'info');
    }
  });

  // Delegación de eventos en el listado (Completar / Borrar)
  taskList.addEventListener('click', (e) => {
    const card = e.target.closest('[data-id]');
    if (!card) return;

    const taskId = Number(card.dataset.id);

    // Cambiar estado completado
    if (e.target.closest('.btn-toggle')) {
      tasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      saveAndRender();
    }

    // Borrar tarea
    if (e.target.closest('.btn-delete')) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveAndRender();
      showToast('Tarea eliminada', 'danger');
    }
  });

  // --- FUNCIONES DE RENDIMIENTO Y LÓGICA ---

  function saveAndRender() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    updateStats();
    renderTasks();
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    statTotal.textContent = total;
    statPending.textContent = pending;
    statCompleted.textContent = completed;
    statPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }

  function getCategoryIcon(category) {
    const icons = {
      DAW: 'fa-code',
      IT: 'fa-server',
      Administración: 'fa-file-invoice',
      Personal: 'fa-user'
    };
    return icons[category] || 'fa-tag';
  }

  function renderTasks() {
    const filteredTasks = tasks.filter(task => {
      const matchesFilter =
        currentFilter === 'all' ? true :
        currentFilter === 'pending' ? !task.completed :
        task.completed;

      const matchesSearch = task.title.toLowerCase().includes(searchQuery) ||
                            task.category.toLowerCase().includes(searchQuery);

      return matchesFilter && matchesSearch;
    });

    if (filteredTasks.length === 0) {
      taskList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    taskList.innerHTML = filteredTasks.map(task => `
      <div data-id="${task.id}" class="task-card ${task.completed ? 'task-completed' : ''}">
        
        <div class="task-left">
          <button class="btn-toggle" title="Marcar como ${task.completed ? 'pendiente' : 'completada'}">
            ${task.completed 
              ? '<i class="fa-solid fa-circle-check icon-completed"></i>' 
              : '<i class="fa-regular fa-circle"></i>'}
          </button>

          <div class="task-info">
            <h4 class="task-title">${escapeHTML(task.title)}</h4>
            <div class="task-meta">
              <span><i class="fa-solid ${getCategoryIcon(task.category)}"></i> ${task.category}</span>
              <span>•</span>
              <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
              ${task.dueDate ? `
                <span>•</span>
                <span><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>
              ` : ''}
            </div>
          </div>
        </div>

        <button class="btn-delete" title="Eliminar tarea">
          <i class="fa-regular fa-trash-can"></i>
        </button>

      </div>
    `).join('');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function showToast(message, type = 'success') {
    toastMsg.textContent = message;

    if (type === 'danger') {
      toastIcon.className = 'fa-solid fa-circle-xmark';
      toastIcon.style.color = 'var(--accent-danger)';
    } else if (type === 'info') {
      toastIcon.className = 'fa-solid fa-circle-info';
      toastIcon.style.color = '#38bdf8';
    } else {
      toastIcon.className = 'fa-solid fa-circle-check';
      toastIcon.style.color = 'var(--accent-success)';
    }

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Inicialización
  saveAndRender();

});