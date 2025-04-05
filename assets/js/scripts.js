// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initializeSchedule();
    displayAllSchedules(); // Cambiado de loadSchedule a displayAllSchedules
});

// 

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initializeSchedule();
    loadSchedule();
});

// Funciones para cambiar entre pestañas
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('section');
    
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if(tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });

    sections.forEach(section => {
        section.classList.add('hidden-section');
        if(section.id === `${tabName}-section`) {
            section.classList.remove('hidden-section');
        }
    });
}

// Funciones para tareas
function addTask() {
    const taskInput = document.getElementById('newTask');
    const daySelect = document.getElementById('daySelect');
    const taskText = taskInput.value.trim();
    const selectedDay = daySelect.value;

    if (taskText === '') {
        alert('Por favor, escribe una tarea');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    let tasks = JSON.parse(localStorage.getItem(`tasks_${selectedDay}`) || '[]');
    tasks.push(task);
    localStorage.setItem(`tasks_${selectedDay}`, JSON.stringify(tasks));
    displayTasks(selectedDay, tasks);
    taskInput.value = '';
}

function loadTasks() {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    days.forEach(day => {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${day}`) || '[]');
        displayTasks(day, tasks);
    });
}

function displayTasks(day, tasks) {
    const dayElement = document.getElementById(day);
    const taskList = dayElement.querySelector('.task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}" onclick="toggleTask('${day}', ${task.id})">
                ${task.text}
            </span>
            <button class="delete-btn" onclick="deleteTask('${day}', ${task.id})">
                Eliminar
            </button>
        `;
        taskList.appendChild(li);
    });
}

function deleteTask(day, taskId) {
    let tasks = JSON.parse(localStorage.getItem(`tasks_${day}`) || '[]');
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem(`tasks_${day}`, JSON.stringify(tasks));
    displayTasks(day, tasks);
}

function toggleTask(day, taskId) {
    let tasks = JSON.parse(localStorage.getItem(`tasks_${day}`) || '[]');
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    localStorage.setItem(`tasks_${day}`, JSON.stringify(tasks));
    displayTasks(day, tasks);
}

function initializeSchedule() {
    const timeColumn = document.querySelector('.time-slots');
    const startHour = 7;
    const endHour = 24; // Cambiado para incluir hasta las 23:59
    
    timeColumn.innerHTML = ''; // Limpiar antes de agregar
    
    for (let hour = startHour; hour < endHour; hour++) {
        // Crear slot para la hora en punto
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        timeColumn.appendChild(timeSlot);
        
        // Crear slot para la media hora
        if (hour < 23) { // Solo crear medias horas hasta las 23:30
            const halfHourSlot = document.createElement('div');
            halfHourSlot.className = 'time-slot half-hour';
            halfHourSlot.textContent = `${hour.toString().padStart(2, '0')}:30`;
            timeColumn.appendChild(halfHourSlot);
        }
    }
}

function addClass() {
    const className = document.getElementById('className').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const day = document.getElementById('scheduleDaySelect').value;

    if (!className || !startTime || !endTime) {
        alert('Por favor, completa todos los campos');
        return;
    }

    // Validar el rango de horas (7:00 - 23:59)
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinutes = parseInt(endTime.split(':')[1]);
    
    if (startHour < 7 || (endHour > 23 || (endHour === 23 && endMinutes > 59)) || startHour >= endHour) {
        alert('Por favor, ingresa un horario válido entre 7:00 y 23:59');
        return;
    }

    const classInfo = {
        name: className,
        startTime,
        endTime,
        id: Date.now()
    };

    let schedule = JSON.parse(localStorage.getItem(`schedule_${day}`) || '[]');
    
    // Verificar superposición de horarios
    const hasOverlap = schedule.some(existingClass => {
        const existingStart = timeToMinutes(existingClass.startTime);
        const existingEnd = timeToMinutes(existingClass.endTime);
        const newStart = timeToMinutes(startTime);
        const newEnd = timeToMinutes(endTime);
        
        return (newStart < existingEnd && newEnd > existingStart);
    });

    if (hasOverlap) {
        alert('Ya existe una clase en ese horario');
        return;
    }

    schedule.push(classInfo);
    localStorage.setItem(`schedule_${day}`, JSON.stringify(schedule));
    
    displaySchedule(day, schedule);
    clearScheduleInputs();
}

// Función para mostrar todos los horarios
function displayAllSchedules() {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    days.forEach(day => {
        const schedule = JSON.parse(localStorage.getItem(`schedule_${day}`) || '[]');
        displaySchedule(day, schedule);
    });
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function createClassBlock(classInfo) {
    const block = document.createElement('div');
    block.className = 'class-block';
    block.textContent = `${classInfo.name}\n${classInfo.startTime} - ${classInfo.endTime}`;
    block.dataset.classId = classInfo.id;
    
    const startMinutes = timeToMinutes(classInfo.startTime) - timeToMinutes('07:00');
    const endMinutes = timeToMinutes(classInfo.endTime) - timeToMinutes('07:00');
    const duration = endMinutes - startMinutes;

    block.style.top = `${startMinutes}px`;
    block.style.height = `${duration}px`;

    block.addEventListener('click', () => showClassModal(classInfo));

    return block;
}

function displaySchedule(day, schedule) {
    const dayColumn = document.querySelector(`.day-column[data-day="${day}"] .class-slots`);
    dayColumn.innerHTML = '';

    schedule.forEach(classInfo => {
        const classBlock = createClassBlock(classInfo);
        dayColumn.appendChild(classBlock);
    });
}

// ... (mantener el resto de las funciones) ...


function showClassModal(classInfo) {
    // Crear o actualizar el modal
    let modal = document.querySelector('.class-modal');
    let backdrop = document.querySelector('.modal-backdrop');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'class-modal';
        document.body.appendChild(modal);
        
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
    }

    modal.innerHTML = `
        <h3>${classInfo.name}</h3>
        <p>Horario: ${classInfo.startTime} - ${classInfo.endTime}</p>
        <button class="delete-class-btn" onclick="deleteClass('${classInfo.id}')">Eliminar clase</button>
    `;

    modal.style.display = 'block';
    backdrop.style.display = 'block';

    // Cerrar modal al hacer clic fuera
    backdrop.onclick = () => {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    };
}

function deleteClass(classId) {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    
    days.forEach(day => {
        let schedule = JSON.parse(localStorage.getItem(`schedule_${day}`) || '[]');
        const originalLength = schedule.length;
        
        schedule = schedule.filter(classInfo => classInfo.id.toString() !== classId.toString());
        
        if (schedule.length !== originalLength) {
            localStorage.setItem(`schedule_${day}`, JSON.stringify(schedule));
            displaySchedule(day, schedule);
        }
    });

    // Cerrar el modal
    document.querySelector('.class-modal').style.display = 'none';
    document.querySelector('.modal-backdrop').style.display = 'none';
}

// ... (mantener el resto de las funciones) ...

// ... (mantener las funciones anteriores de tareas) ...

function addClass() {
    const className = document.getElementById('className').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const day = document.getElementById('scheduleDaySelect').value;

    if (!className || !startTime || !endTime) {
        alert('Por favor, completa todos los campos');
        return;
    }

    if (!isValidTimeRange(startTime, endTime)) {
        alert('El horario debe estar entre las 7:00 y las 23:59, y la hora de fin debe ser posterior a la de inicio');
        return;
    }

    const classInfo = {
        id: Date.now(),
        name: className,
        startTime,
        endTime
    };

    let schedule = JSON.parse(localStorage.getItem(`schedule_${day}`) || '[]');
    
    if (hasTimeConflict(schedule, startTime, endTime)) {
        alert('Ya existe una clase en ese horario');
        return;
    }

    // Ordenar las clases por hora de inicio
    schedule.push(classInfo);
    schedule.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    localStorage.setItem(`schedule_${day}`, JSON.stringify(schedule));
    displaySchedule(day, schedule);
    clearScheduleInputs();
}

function isValidTimeRange(start, end) {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const minTime = timeToMinutes('07:00');
    const maxTime = timeToMinutes('23:59');

    return startMinutes >= minTime && 
           endMinutes <= maxTime && 
           startMinutes < endMinutes;
}

function hasTimeConflict(schedule, newStart, newEnd) {
    const newStartMin = timeToMinutes(newStart);
    const newEndMin = timeToMinutes(newEnd);

    return schedule.some(existingClass => {
        const existingStartMin = timeToMinutes(existingClass.startTime);
        const existingEndMin = timeToMinutes(existingClass.endTime);
        return (newStartMin < existingEndMin && newEndMin > existingStartMin);
    });
}

function displaySchedule(day, schedule) {
    const dayElement = document.querySelector(`#${day}-schedule .class-list`);
    dayElement.innerHTML = '';

    if (schedule.length === 0) {
        dayElement.innerHTML = '<div class="no-classes">No hay clases programadas</div>';
        return;
    }

    schedule.forEach(classInfo => {
        const classElement = document.createElement('div');
        classElement.className = 'class-item';
        classElement.innerHTML = `
            <div class="class-info">
                <div class="class-name">${classInfo.name}</div>
                <div class="class-time">${formatTime(classInfo.startTime)} - ${formatTime(classInfo.endTime)}</div>
            </div>
            <div class="class-actions">
                <button class="delete-btn" onclick="deleteClass('${day}', ${classInfo.id})">
                    Eliminar
                </button>
            </div>
        `;
        dayElement.appendChild(classElement);
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

function deleteClass(day, classId) {
    let schedule = JSON.parse(localStorage.getItem(`schedule_${day}`) || '[]');
    schedule = schedule.filter(classInfo => classInfo.id !== classId);
    localStorage.setItem(`schedule_${day}`, JSON.stringify(schedule));
    displaySchedule(day, schedule);
}

function displayAllSchedules() {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    days.forEach(day => {
        const schedule = JSON.parse(localStorage.getItem(`schedule_${day}`) || '[]');
        displaySchedule(day, schedule);
    });
}

function clearScheduleInputs() {
    document.getElementById('className').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    displayAllSchedules();
});