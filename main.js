var moduleContainer = document.getElementById('module-info');
var btn = document.getElementById("btn");

btn.addEventListener("click", function() {
  var ourRequest = new XMLHttpRequest();
  ourRequest.open('GET', 'http://localhost:3000/modules');
  ourRequest.onload = function() {
    var ourData = JSON.parse(ourRequest.responseText);
    renderHTML(ourData);
  };
  ourRequest.send();
});

function renderHTML(data) {
  var htmlString = "";

  for (var i = 0; i < data.length; i++) {
    htmlString += "<p>" + data[i].Name + " is a " + data[i].Course + " course and has assessments ";
    for (var ii = 0; ii < data[i].Module.Assignment.length; ii++) {
      if (ii === 0) {
        htmlString += data[i].Module.Assignment[ii];
      } else {
        htmlString += " and " + data[i].Module.Assignment[ii];
      }
    }
    htmlString += ' with Learning Outcomes ';
    for (var iii = 0; iii < data[i].Module.Learning_outcomes.length; iii++) {
      if (iii === 0) {
        htmlString += data[i].Module.Learning_outcomes[iii];
      } else {
        htmlString += " and " + data[i].Module.Learning_outcomes[iii];
      }
    }

    htmlString += ' having Volumes ';
    for (var iv = 0; iv < data[i].Module.Volume.length; iv++) {
      if (iv === 0) {
        htmlString += data[i].Module.Volume[iv];
      } else {
        htmlString += " and " + data[i].Module.Volume[iv];
      }
    }

    htmlString += ' and weights ';
    for (var v = 0; v < data[i].Module.weights.length; v++) {
      if (v === 0) {
        htmlString += data[i].Module.weights[v];
      } else {
        htmlString += " and " + data[i].Module.weights[v];
      }
    }
    htmlString += '.</p>';
  }
  moduleContainer.insertAdjacentHTML('beforeend', htmlString);
}

// Create New Module
document.getElementById("createModuleBtn").addEventListener("click", function() {
  var moduleName = document.getElementById("moduleName").value;
  var moduleCourse = document.getElementById("moduleCourse").value;
  var newModule = {
    id: Date.now(),
    Name: moduleName,
    Course: moduleCourse,
    Module: {
      Learning_outcomes: [],
      Assignment: [],
      Volume: [],
      weights: [],
      Assessments: [],
      Time_slots: []
    }
  };

  fetch('http://localhost:3000/modules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newModule)
  })
  .then(response => response.json())
  .then(data => {
    alert('Module created successfully');
  });
});

// Create New Degree Program
document.getElementById("createDegreeBtn").addEventListener("click", function() {
  var degreeCode = document.getElementById("degreeCode").value;
  var degreeName = document.getElementById("degreeName").value;
  var moduleIds = document.getElementById("moduleIds").value.split(',').map(Number);
  var newDegree = {
    id: Date.now(),
    code: degreeCode,
    name: degreeName,
    modules: moduleIds
  };

  fetch('http://localhost:3000/degree_programs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newDegree)
  })
  .then(response => response.json())
  .then(data => {
    alert('Degree program created successfully');
  });
});

// Schedule Assessment Dates
document.getElementById("scheduleAssessmentBtn").addEventListener("click", function() {
  var moduleId = document.getElementById("moduleId").value;
  var assessmentTitle = document.getElementById("assessmentTitle").value;
  var assessmentDate = document.getElementById("assessmentDate").value;
  var newAssessment = {
    id: Date.now(),
    title: assessmentTitle,
    date: assessmentDate
  };

  fetch(`http://localhost:3000/modules/${moduleId}`)
    .then(response => response.json())
    .then(module => {
      module.Module.Assessments.push(newAssessment);
      return fetch(`http://localhost:3000/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(module)
      });
    })
    .then(response => response.json())
    .then(data => {
      alert('Assessment scheduled successfully');
    });
});

// Schedule Module Time-Slots
document.getElementById("scheduleTimeslotBtn").addEventListener("click", function() {
  var moduleId = document.getElementById("moduleIdTimeslot").value;
  var day = document.getElementById("day").value;
  var startTime = document.getElementById("startTime").value;
  var endTime = document.getElementById("endTime").value;
  var room = document.getElementById("room").value;
  var newTimeSlot = {
    id: Date.now(),
    day: day,
    startTime: startTime,
    endTime: endTime,
    room: room
  };

  fetch(`http://localhost:3000/modules/${moduleId}`)
    .then(response => response.json())
    .then(module => {
      module.Module.Time_slots.push(newTimeSlot);
      return fetch(`http://localhost:3000/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(module)
      });
    })
    .then(response => response.json())
    .then(data => {
      alert('Time-slot scheduled successfully');
    });
});
 