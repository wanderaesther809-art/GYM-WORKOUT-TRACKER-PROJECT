const API_URL = "http://localhost:3000";
let allExercises = [];

// Fetch all exercises
function fetchExercises() {
  fetch(`${API_URL}/exercises`)
    .then((res) => res.json())
    .then((data) => {
      allExercises = data;
      populateExercises(data);
      populateDropdown(data);
    });
}

// Populate exercise library
function populateExercises(exercises) {
  const exerciseList = document.getElementById("exercise-cards");
  exerciseList.innerHTML = "";
  exercises.forEach((ex) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ex.name}</strong> - ${ex.muscle_group} (${ex.equipment})<br>
      <img src="${ex.image}" alt="${ex.name}" width="120">
    `;
    exerciseList.appendChild(li);
  });
}

// Populate dropdown
function populateDropdown(exercises) {
  const select = document.getElementById("exerciseSelect");
  select.innerHTML = "";
  exercises.forEach((ex) => {
    const option = document.createElement("option");
    option.value = ex.id;
    option.textContent = ex.name;
    select.appendChild(option);
  });
}

// Fetch workout sessions
function fetchSessions() {
  fetch(`${API_URL}/workouts?_expand=exercise`)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#session-list tbody");
      tbody.innerHTML = "";

      data.forEach((session) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${session.exercise?.name || "Unknown"}</td>
          <td>${session.sets}</td>
          <td>${session.reps}</td>
          <td>${session.weight}</td>
          <td>${session.date}</td>
          <td>
            <button class="edit-btn" data-id="${session.id}">Edit</button>
            <button class="delete-btn" data-id="${session.id}">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      addSessionListeners();
    });
}

// Log new workout
document.getElementById("session-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const newSession = {
    exerciseId: parseInt(document.getElementById("exerciseSelect").value),
    sets: parseInt(document.getElementById("setsInput").value),
    reps: parseInt(document.getElementById("repsInput").value),
    weight: parseInt(document.getElementById("weightInput").value) || 0,
    date: new Date().toISOString().split("T")[0], // pick date OR default today
  };

  fetch(`${API_URL}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSession),
  }).then(() => {
    fetchSessions();
    e.target.reset();
  });
});

// Add delete and edit functionality
function addSessionListeners() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      fetch(`${API_URL}/workouts/${id}`, { method: "DELETE" }).then(() =>
        fetchSessions()
      );
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const newSets = prompt("Enter new sets:");
      const newReps = prompt("Enter new reps:");
      const newWeight = prompt("Enter new weight (kg):");
      const newDate = prompt("Enter new date (YYYY-MM-DD):");

      fetch(`${API_URL}/workouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sets: parseInt(newSets),
          reps: parseInt(newReps),
          weight: parseInt(newWeight),
          date: newDate,
        }),
      }).then(() => fetchSessions());
    });
  });
}

// Filter exercises by muscle group
document.querySelectorAll("#filter-exercises button").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const group = e.target.dataset.group;
    if (group === "All") populateExercises(allExercises);
    else
      populateExercises(allExercises.filter((ex) => ex.muscle_group === group));
  });
});

// Initialize
fetchExercises();
fetchSessions();
