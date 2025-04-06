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
        alert('Please write an assignment');
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
                Delete
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
        alert('Please complete all fields');
        return;
    }

    // Validar el rango de horas (7:00 - 23:59)
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinutes = parseInt(endTime.split(':')[1]);
    
    if (startHour < 7 || (endHour > 23 || (endHour === 23 && endMinutes > 59)) || startHour >= endHour) {
        alert('Please enter a valid time between 7:00 and 23:59');
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
        alert('There is already a class at that time');
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
        <button class="delete-class-btn" onclick="deleteClass('${classInfo.id}')">Delete class</button>
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
        alert('The schedule must be between 7:00 and 23:59, and the end time must be after the start time.');
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
        alert('There is already a class at that time');
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
        dayElement.innerHTML = '<div class="no-classes">There are no classes scheduled</div>';
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

// Agregar estas nuevas funciones al archivo existente

// Función para procesar la tarea
async function processHomework() {
    const questionInput = document.getElementById('homeworkQuestion');
    const submitButton = document.getElementById('submitHomework');
    const responseArea = document.getElementById('homeworkResponse');
    const loader = submitButton.querySelector('.loader');
    
    const question = questionInput.value.trim();
    
    if (!question) {
        showError('Please write a question or topic.');
        return;
    }

    let prompt = `I have a school assignment to do. Please give me a concise answer, without beating around the bush.THE MOST IMPORTANT THING IS: GIVE ME AN ANSWER IN ENGLISH, It doesn't matter if the homework is in Spanish: ${question}`;

    // Deshabilitar el botón y mostrar loader
    submitButton.disabled = true;
    loader.classList.remove('hidden');
    responseArea.textContent = 'Processing your homework...';

    try {
        const url = 'https://magicloops.dev/api/loop/6cab76fa-d563-4fda-b6d1-a1a2834f0461/run';
        
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: prompt }),
        });

        if (!response.ok) {
            throw new Error('Error connecting to the server');
        }

        const data = await response.json();
        
        // Mostrar la respuesta formateada
        displayResponse(data.respuesta);

    } catch (error) {
        showError('Sorry, there was an error processing your question. Please try again.');
        console.error('Error:', error);
    } finally {
        // Restaurar el estado del botón y ocultar loader
        submitButton.disabled = false;
        loader.classList.add('hidden');
    }
}

// Función para mostrar la respuesta
function displayResponse(data) {
    const responseArea = document.getElementById('homeworkResponse');
    
    // Asumiendo que la respuesta viene en data.response o similar
    // Ajusta esto según la estructura real de la respuesta de tu API
    const response = data.response || data.result || data.message || JSON.stringify(data);
    
    responseArea.innerHTML = `
        <div class="response-text">
            ${formatResponse(response)}
        </div>
    `;
}

// Función para formatear la respuesta
function formatResponse(text) {
    // Convertir los "\n" en saltos de línea HTML
    let formattedText = text
        .replace(/\\n/g, '<br>')    // "\n" como texto plano (de la IA)
        .replace(/\n/g, '<br>')     // saltos de línea reales
        .replace(/[#\\]/g, '')      // eliminar caracteres especiales como "#" y "\"
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // negrita tipo Markdown
        .replace(/\*(.*?)\*/g, '<em>$1</em>');            // cursiva tipo Markdown

    return formattedText;
}

// Función para mostrar errores
function showError(message) {
    const responseArea = document.getElementById('homeworkResponse');
    responseArea.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
}

// Actualizar la función switchTab existente para incluir la nueva sección
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

// Event listener para el textarea
document.getElementById('homeworkQuestion')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        processHomework();
    }
});