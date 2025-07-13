let correctAnswers = [];
let timerInterval;
let loadedContent = '';


function loadFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    loadedContent = e.target.result;
    document.getElementById('inputArea').value = '';
    document.getElementById('fileStatus').textContent = `✅ "${file.name}" loaded successfully!`;
  };
  reader.readAsText(file);
}


function prepareQuiz() {
  const inputArea = document.getElementById('inputArea')?.value.trim();
  const input = inputArea !== '' ? inputArea : loadedContent.trim();

  if (!input) {
    alert("Please paste questions or upload a file.");
    return;
  }

  const timer = document.getElementById("timerInput")?.value;
  localStorage.setItem("quizData", input);
  if (timer) localStorage.setItem("quizTimer", timer);

  window.location.href = "quiz.html";
}


function buildQuiz() {
  const input = localStorage.getItem("quizData");
  if (!input) {
    document.getElementById('quizContainer').innerHTML = "<p>No quiz data found. Go back and generate one.</p>";
    return;
  }

  correctAnswers = [];
  const quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = '';
  const timer = document.getElementById('timer');
  timer.innerHTML = '';

  const blocks = input.split(/\n\s*\n/);

  blocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    const questionText = lines[0].replace(/^Q:\s*/i, '');
    const options = lines.slice(1, 5).map(line => line.trim());
    const answerLine = lines.find(line => line.toLowerCase().startsWith('answer:'));
    const correct = answerLine ? answerLine.split(':')[1].trim().toUpperCase() : '';
    correctAnswers.push(correct);

    const div = document.createElement('div');
    div.className = 'question';
    let html = `<p><b>Q${index + 1}:</b> ${questionText}</p>`;
    options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      html += `<label><input type="radio" name="q${index}" value="${letter}"> ${opt}</label><br>`;
    });
    div.innerHTML = html;
    quizContainer.appendChild(div);
  });


  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit Quiz';
  submitBtn.onclick = gradeQuiz;
  quizContainer.appendChild(submitBtn);

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅ Back';
  backBtn.onclick = () => window.location.href = 'index.html';
  quizContainer.appendChild(backBtn);


  const timerMinutes = parseInt(localStorage.getItem('quizTimer'));
  if (!isNaN(timerMinutes) && timerMinutes > 0) {
    startTimer(timerMinutes);
  }
}


function startTimer(minutes) {
  let totalSeconds = minutes * 60;
  const timerDisplay = document.getElementById('timer');

  function updateDisplay() {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    timerDisplay.textContent = `Time Remaining: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateDisplay();
  timerInterval = setInterval(() => {
    totalSeconds--;
    updateDisplay();
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      gradeQuiz();
      alert("Time's up! Quiz submitted automatically.");
    }
  }, 1000);
}


function gradeQuiz() {
  clearInterval(timerInterval);
  let score = 0;
  const userAnswers = [];
  const questionsData = [];

  const questions = document.querySelectorAll('.question');
  questions.forEach((question, i) => {
    const selected = question.querySelector('input[type="radio"]:checked');
    const correct = correctAnswers[i];

    let userAnswer = "Not answered";
    if (selected) {
      userAnswer = selected.value;
      if (userAnswer === correct) score++;
    }

    userAnswers.push(userAnswer);
    questionsData.push({
      question: question.querySelector('p').innerText
    });

    const feedback = document.createElement('div');
    feedback.className = 'feedback';

    if (userAnswer === correct) {
      question.classList.add('correct');
      feedback.textContent = '✅ Correct!';
      feedback.style.color = '#28a745';
    } else {
      question.classList.add('incorrect');
      feedback.textContent = `❌ Wrong! Correct answer: ${correct}`;
      feedback.style.color = '#dc3545';
    }

    question.appendChild(feedback);
  });

  const total = correctAnswers.length;

  if (score === total && total > 0) {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    alert("🎉 You Rock! Perfect Score!");
  }

  localStorage.setItem("quizResult", JSON.stringify({
    score,
    total,
    correctAnswers,
    userAnswers,
    questions: questionsData
  }));

  window.location.href = "result.html";
}


function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}
