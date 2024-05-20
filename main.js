document.addEventListener('DOMContentLoaded', function() {
  fetchModules();
  fetchDegreePrograms();

  // Event listeners for form submission
  document.getElementById("module-form").addEventListener("submit", handleModuleSubmit);
  document.getElementById("degree-form").addEventListener("submit", handleDegreeSubmit);
  document.getElementById("assessment-form").addEventListener("submit", handleAssessmentSubmit);
  document.getElementById("timeslot-form").addEventListener("submit", handleTimeslotSubmit);

  // Event listeners for opening modals
  document.getElementById("moduleBtn").addEventListener("click", () => showModal('moduleModal'));
  document.getElementById("degreeBtn").addEventListener("click", () => showModal('degreeModal'));
  document.getElementById("assessmentBtn").addEventListener("click", () => showModal('assessmentModal'));
  document.getElementById("timeslotBtn").addEventListener("click", () => showModal('timeslotModal'));

  // Event listeners for closing modals
  document.querySelectorAll('.modal .close').forEach(close => {
      close.addEventListener("click", () => closeModal(close.getAttribute('data-modal')));
  });

  window.addEventListener("click", event => {
      if (event.target.className === "modal") {
          closeModal(event.target.id);
      }
  });
});

function fetchModules() {
  fetch('http://localhost:3000/modules')
      .then(response => response.json())
      .then(data => {
          populateModuleDropdowns(data);
          populateModuleList(data);
      })
      .catch(error => console.error('Error fetching modules:', error));
}

function fetchDegreePrograms() {
  fetch('http://localhost:3000/degree_programs')
      .then(response => response.json())
      .then(data => {
          populateDegreeDropdowns(data);
      })
      .catch(error => console.error('Error fetching degree programs:', error));
}

function populateModuleDropdowns(data) {
  const moduleSelects = document.querySelectorAll('select[id$="moduleId"], select[id="moduleIds"]');
  moduleSelects.forEach(select => {
      select.innerHTML = data.map(module => `<option value="${module.id}">${module.Name}</option>`).join('');
  });
}

function populateDegreeDropdowns(data) {
  const degreeSelects = document.querySelectorAll('select[id="degreePrograms"]');
  degreeSelects.forEach(select => {
      select.innerHTML = data.map(degree => `<option value="${degree.id}">${degree.name}</option>`).join('');
  });
}

function populateModuleList(data) {
  const moduleContainer = document.getElementById('module-info');
  moduleContainer.innerHTML = data.map(module => {
      return `<p>${module.Name} is a ${module.Course} course with assignments ${module.Module.Assignment.join(', ')}, learning outcomes ${module.Module.Learning_outcomes.join(', ')}, volumes ${module.Module.Volume.join(', ')}, and weights ${module.Module.weights.join(', ')}.</p>`;
  }).join('');
}

function handleModuleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const moduleData = {
      Name: form.moduleName.value,
      Course: form.moduleCourse.value,
      Module: {
          Learning_outcomes: form.learningOutcomes.value.split(',').map(item => item.trim()),
          Assignment: form.assignments.value.split(',').map(item => item.trim()),
          Volume: form.volumes.value.split(',').map(item => item.trim()),
          weights: form.weights.value.split(',').map(item => item.trim()),
          Assessments: [],
          Time_slots: []
      }
  };
  const degreeIds = Array.from(form.degreePrograms.selectedOptions).map(option => parseInt(option.value));

  fetch('http://localhost:3000/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData)
  })
  .then(response => response.json())
  .then(module => {
      // Add the new module to the selected degree programs
      degreeIds.forEach(degreeId => {
          addModuleToDegree(degreeId, module.id);
      });
      alert('Module created successfully');
      closeModal('moduleModal');
      fetchModules();
  })
  .catch(error => console.error('Error creating module:', error));
}

function addModuleToDegree(degreeId, moduleId) {
  fetch(`http://localhost:3000/degree_programs/${degreeId}`)
      .then(response => response.json())
      .then(degree => {
          degree.modules.push(moduleId);
          return fetch(`http://localhost:3000/degree_programs/${degreeId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(degree)
          });
      })
      .catch(error => console.error('Error updating degree program:', error));
}

function handleDegreeSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const degreeData = {
      code: form.degreeCode.value,
      name: form.degreeName.value,
      modules: Array.from(form.moduleIds.selectedOptions).map(option => parseInt(option.value))
  };

  fetch('http://localhost:3000/degree_programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(degreeData)
  })
  .then(response => response.json())
  .then(() => {
      alert('Degree program created successfully');
      closeModal('degreeModal');
      fetchDegreePrograms();
  })
  .catch(error => console.error('Error creating degree program:', error));
}

function handleAssessmentSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const moduleId = form.moduleId.value;
  const assessmentData = {
      id: Date.now(),
      title: form.assessmentTitle.value,
      date: form.assessmentDate.value
  };

  fetch(`http://localhost:3000/modules/${moduleId}`)
      .then(response => response.json())
      .then(module => {
          module.Module.Assessments.push(assessmentData);
          return fetch(`http://localhost:3000/modules/${moduleId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(module)
          });
      })
      .then(() => {
          alert('Assessment scheduled successfully');
          closeModal('assessmentModal');
      })
      .catch(error => console.error('Error scheduling assessment:', error));
}

function handleTimeslotSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const moduleId = form.moduleIdTimeslot.value;
  const timeslotData = {
      id: Date.now(),
      day: form.day.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
      room: form.room.value
  };

  fetch(`http://localhost:3000/modules/${moduleId}`)
      .then(response => response.json())
      .then(module => {
          module.Module.Time_slots.push(timeslotData);
          return fetch(`http://localhost:3000/modules/${moduleId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(module)
          });
      })
      .then(() => {
          alert('Time-slot scheduled successfully');
          closeModal('timeslotModal');
      })
      .catch(error => console.error('Error scheduling time-slot:', error));
}

function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}
