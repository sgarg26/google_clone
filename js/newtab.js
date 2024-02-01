let timeoutId
let hover_timeoutId
let timeDiv = document.getElementById("date-time")
const fname = document.getElementById("fname")
const startTimerBtn = document.getElementById("pomStart")
const shortBreakBtn = document.getElementById("shortBreakTimer")
const longBreakBtn = document.getElementById("longBreakTimer")
const pomodoroBtn = document.getElementById("pomodoroTimer")
const timeRem = document.getElementById("time-rem")
let curr_button = pomodoroBtn
const pomReset = document.getElementById("pomReset")
let timeRemTimeout = 0
let inProgress = false
let isPaused = false
let pausedTimeArray = []

function getTime() {
    clearTimeout(hover_timeoutId)
    let date = new Date()
    let hours = date.getHours().toString().padStart(2, '0')
    let minutes = date.getMinutes().toString().padStart(2, '0')
    let timeElement = document.getElementById("date-time")
    timeElement.textContent = hours + ':' + minutes
    timeoutId = setTimeout(getTime, 1000)
}

function getTimeHover() {
    clearTimeout(timeoutId)
    let date = new Date()
    let hours = date.getHours().toString().padStart(2, '0')
    let minutes = date.getMinutes().toString().padStart(2, '0')
    let seconds = date.getSeconds().toString().padStart(2, '0')
    let timeElement = document.getElementById("date-time")
    timeElement.textContent = hours + ':' + minutes + ':' + seconds
    hover_timeoutId = setTimeout(getTimeHover, 1000)
}

function setInnerText(minutes, seconds) {
    timeRem.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function timer(minutes, seconds) {
    timeRemTimeout = setInterval(() => {
        inProgress = true
        setInnerText(minutes, seconds)
        if (!minutes && !seconds) clearInterval(timeRemTimeout)
        else if (!seconds) {
            seconds = 59
            minutes -= 1
        }
        else {
            seconds -= 1
        }
    }, 1000)
    inProgress = false
    isPaused = false
}

function toggleTimerBtn() {
    if (startTimerBtn.innerText === "Pause") startTimerBtn.innerText = "Start"
    else startTimerBtn.innerText = "Pause"
}

timeDiv.addEventListener("mouseenter", () => {
    getTimeHover()
})

timeDiv.addEventListener("mouseleave", () => {
    getTime()
})

fname.addEventListener("mouseout", () => {
    if (fname.value === "")
        fname.style.width = "180px"
    else {
        chrome.storage.local.set({fname_key: fname.value})
        fname.style.width = "60px"
        fname.style.width = fname.scrollWidth + "px"
        chrome.storage.local.set({fname_width: fname.style.width})
    }
})

fname.addEventListener("mousedown", () => {
    fname.style.outline = "none"
})

startTimerBtn.addEventListener("mouseup", () => {
    if (!inProgress && !isPaused) {
        toggleTimerBtn()
        switch (curr_button) {
            case pomodoroBtn:
                timer(25, 0)
                break
            case shortBreakBtn:
                timer(5, 0)
                break
            case longBreakBtn:
                timer(10, 0)
        }
    }
    else if (isPaused) {
        isPaused = false
        inProgress = true
        toggleTimerBtn()
        timer(pausedTimeArray[0], pausedTimeArray[1])
    }
    else {
        isPaused = true
        inProgress = false
        clearInterval(timeRemTimeout)
        toggleTimerBtn()
        pausedTimeArray = timeRem.innerText.split(':')
        for (let i = 0; i < 2; i++) pausedTimeArray[i] = parseInt(pausedTimeArray[i])
    }
})

pomReset.addEventListener("mouseup", () => {
    switch (curr_button) {
        case pomodoroBtn:
            setInnerText(25, 0)
            clearInterval(timeRemTimeout)
            break
        case shortBreakBtn:
            setInnerText(5, 0)
            clearInterval(timeRemTimeout)
            break
        case longBreakBtn:
            setInnerText(10, 0)
            clearInterval(timeRemTimeout)
    }
    inProgress = false
    isPaused = false
    startTimerBtn.innerText = "Start"
})

pomodoroBtn.addEventListener("mouseup", () => {
    if (!inProgress) {
        setInnerText(25, 0)
        curr_button = pomodoroBtn
    }
})

shortBreakBtn.addEventListener("mouseup", () => {
    if (!inProgress) {
        setInnerText(5, 0)
        curr_button = shortBreakBtn
    }
})

longBreakBtn.addEventListener("mouseup", () => {
    if (!inProgress) {
        setInnerText(10, 0)
        curr_button = longBreakBtn
    }
})

document.addEventListener("DOMContentLoaded", () => {
    getTime()
    chrome.storage.local.get('fname_key', (result) => {
        if (result.fname_key) {
            fname.value = result.fname_key
        }
    })
    chrome.storage.local.get('fname_width', (result) => {
        if (result.fname_width) {
            fname.style.width = result.fname_width
            console.log(result.fname_width)
        }
    })
    fetch("https://api.quotable.io/random")
        .then(response => response.json())
        .then(data => {
            const quoteDiv = document.getElementById("quote")
            quoteDiv.innerText = data.content + ' - ' + data.author
        })
})
