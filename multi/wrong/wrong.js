const questions = [
    "What is a toaster used for?",
    "Why did the chicken cross the road?",
    "What does DNA stand for?",
    "How do airplanes stay in the sky?",
    "Who is Darth Vader?",
    "What happens when you press Alt+F4?",
    "Where do babies come from?",
    "What are clouds made of?",
    "What is the purpose of a steering wheel?",
    "How do you make ice?",
    "What is the internet?",
    "Why do dogs bark?",
    "What is the sun?",
    "How do fish breathe?",
    "What do you do at a green traffic light?",
    "What is the capital of France?",
    "How do you put out a fire?"
];

const questionDisplay = document.getElementById('question-display');
const nextBtn = document.getElementById('next-btn');

function getRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
}

function showNextQuestion() {
    let nextQuestion = getRandomQuestion();

    while (nextQuestion === questionDisplay.textContent && questions.length > 1) {
        nextQuestion = getRandomQuestion();
    }

    questionDisplay.textContent = nextQuestion;
}

showNextQuestion();
nextBtn.addEventListener('click', showNextQuestion);