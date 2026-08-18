const box =document.getElementById('game-box');
const title =document.getElementById('title');
const instructionText =document.getElementById('instructionText');
// ohh im open sourcing ittttt
let state = 'start';
let startTimer = 0;
let delayId = null;
// nooo shield your eyes my code is terrible AAAA
box.addEventListener('click', () => {
    if (state === 'start' || state === 'result') {
        state = 'waiting';
        box.style.backgroundColor = '#ce4242';
        title.textContent = "wait";
        instructionText.textContent = "dont click >:/";
        // this spaghetticode makes me want spaghetti
        delayId = setTimeout(() => {
            state = 'ready';
            box.style.backgroundColor = '#2ece76';
            title.textContent = 'click por favor';
            startTimer = window.performance.now();
        }, Math.floor(Math.random() * 3000) + 2000);

    } else if (state === 'waiting') {
        clearTimeout(delayId);
        state = 'result';
        box.style.backgroundColor = '#4a90e2';
        title.textContent = 'too soon';
        instructionText.textContent = 'you make me feel like the guy from 1000 yard stare.';
    } else if (state === 'ready') {
        const elapsed = Math.round((window.performance.now() - startTimer) );
        state = 'result';
        box.style.backgroundColor = '#4a90e2';
        title.textContent = `${elapsed} ms`;
        instructionText.textContent = 'your parents must be proud of your singular accomplishment, being born.';
    }
});

// i warned you