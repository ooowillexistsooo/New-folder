const subtitles = [
    "ruining your productivity since 2026",
    "i want tea...",
    "gaming ehehe",
    "blublublu",
    "made for hack club heres the <a href=\"https://hackclub.com\">hack club website</a>",
    "thanks for stopping by",
    "...did i rip off itch.io..?",
    "its open source too...",
    ":P",
    "how many subtitles am i gonna add...",
    "jsut go play mariokart"
]

const randomSubtitle = Math.floor(Math.random() * subtitles.length);

document.getElementById("subtitle").innerText = subtitles[randomSubtitle];