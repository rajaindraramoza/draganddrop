var x = document.getElementById("myAudio"); 

function playAudio() { 
  x.play(); 
} 

"use strict";
const shuffle = ([...arr]) => {
    let m = arr.length;
    while (m) {
        const i = Math.floor(Math.random() * m--);
        [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
};
const getOffset = (el) => {
    const offset = el.getBoundingClientRect();
    return { top: offset.top - window.scrollY, left: offset.left - window.scrollX };
};
const randomIntArrayInRange = (min, max, n = 1) => Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
class Droppable {
    constructor(el) {
        this.droppableEl = el;
    }
    isDroppable(draggableEl) {
        const draggableOffset = getOffset(draggableEl);
        const droppableOffset = getOffset(this.droppableEl);
        const [draggableWidth, draggableHeight] = [draggableEl.offsetWidth, draggableEl.offsetHeight];
        const [droppableWidth, droppableHeight] = [this.droppableEl.offsetWidth, this.droppableEl.offsetHeight];
        return !(droppableOffset.left > draggableOffset.left + draggableWidth - draggableWidth / 2 ||
            droppableOffset.left + droppableWidth < draggableOffset.left + draggableWidth / 2 ||
            droppableOffset.top > draggableOffset.top + draggableHeight - draggableHeight / 2 ||
            droppableOffset.top + droppableHeight < draggableOffset.top + draggableHeight / 2);
    }
}
class Draggable {
    constructor(el) {
        this.draggableEl = el;
        this.draggie = new Draggabilly(el);
        this.originPos = Object.assign({}, this.draggie.position);
    }
}

const randomBlockWidths = randomIntArrayInRange(30, 60, 10);
const randomBlockBorderRadiuses = randomIntArrayInRange(1, 30, 10);
let draggableBlocks = document.querySelectorAll('.block.draggable');
let targetBlocks = document.querySelectorAll('.block.target');
let startBtn = document.querySelector('#start');
const scoreNumber = document.querySelector(".score-number");
const timeLeftNumber = document.querySelector(".time-left-number");
const finalScoreDialog = document.querySelector("#final-score-dialog");
const finalScore = document.querySelector(".final-score");
const youWin = document.querySelector(".you-win");
const youLose = document.querySelector(".you-lose");
let draggables = Array.from(draggableBlocks).map(block => new Draggable(block));
let droppables = Array.from(targetBlocks).map(block => new Droppable(block));
let score = 0;
let win = false;
const SCOREINC = 10;
const WINSCORE = SCOREINC * targetBlocks.length;
const TIME = 5;
const INTERVAL = 600;
let timer;
let timeLeft = TIME;
const enableBlocks = () => {
    draggables.forEach(draggable => {
        draggable.draggableEl.removeAttribute('disabled');
    });
};
const disableBlocks = () => {
    draggables.forEach(draggable => {
        draggable.draggableEl.setAttribute('disabled', '');
    });
};
const shuffleTargets = () => {
    const cardIndexes = Array.from(Array(targetBlocks.length).keys());
    const shufferedIndexs = shuffle(cardIndexes);
    targetBlocks.forEach((item, i) => item.style.setProperty("--order", shufferedIndexs[i]));
};
const setRandomSizes = (elements) => {
    elements.forEach((item, i) => {
        item.style.setProperty('--width', `${randomBlockWidths[i]}px`);
        item.style.setProperty('--border-radius', `${randomBlockBorderRadiuses[i]}px`);
    });
};

const setRandomBlockSizes = () => {
    setRandomSizes(draggableBlocks);
    setRandomSizes(targetBlocks);
};
const moveBack = (draggable) => {
    const draggableEl = draggable.draggableEl;
    draggableEl.classList.add('animated');
    draggableEl.style.left = `${draggable.originPos.x}`;
    draggableEl.style.top = `${draggable.originPos.y}`;
    draggableEl.addEventListener('transitionend', () => {
        draggableEl.classList.remove('animated');
    });
};
const dropDown = (draggable, droppable) => {
    const draggableEl = draggable.draggableEl;
    draggableEl.setAttribute('transparent', '');
    const droppableEl = droppable.droppableEl;
    droppableEl.classList.add('dropped');
};
const listenDragEvent = () => {
    draggables.forEach(draggable => {
        const draggie = draggable.draggie;
        draggie.on('dragEnd', function () {
            const draggableElement = this.element;
            const dragId = parseInt(draggableElement.dataset.id);
            const correspondingDroppable = droppables[dragId - 1];
            if (correspondingDroppable.isDroppable(draggableElement)) {
                dropDown(draggable, correspondingDroppable);
                score += SCOREINC;
                scoreNumber.textContent = `${score}`;
                winGameJudge();
            }
            else {
                moveBack(draggable);
            }
        });
    });
};
const recoverBlocks = () => {
    draggables.forEach(draggable => {
        moveBack(draggable);
        const draggableEl = draggable.draggableEl;
        draggableEl.classList.remove('animated');
        draggableEl.removeAttribute('transparent');
    });
    droppables.forEach(droppable => {
        const droppableEl = droppable.droppableEl;
        droppableEl.classList.remove('dropped');
    });
};

const cleanData = () => {
    recoverBlocks();
    shuffleTargets();
    score = 0;
    timeLeft = TIME;
    win = false;
    scoreNumber.textContent = `${score}`;
    timeLeftNumber.textContent = `${timeLeft}`;
    youWin.setAttribute("hidden", "");
    youLose.setAttribute("hidden", "");
};
const startGame = () => {
    enableBlocks();
    timer = setInterval(() => {
        timeLeft--;
        timeLeftNumber.textContent = `${timeLeft}`;
        if (timeLeft === 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
};
const endGame = () => {
    disableBlocks();
    showFinalScore();
    startBtn.removeAttribute("transparent");
    startBtn.removeAttribute("disabled");
};
const winGameJudge = () => {
    if (score === WINSCORE) {
        win = true;
        endGame();
    }
};
const showFinalScore = () => {
    clearInterval(timer);
    if (win) {
        youWin.removeAttribute("hidden");
    }
    else {
        youLose.removeAttribute("hidden");
    }
    finalScore.textContent = `${score}`;
    finalScoreDialog.removeAttribute("hidden");
};
const closeFinalScore = () => {
    finalScoreDialog.setAttribute("hidden", "");
    cleanData();
};
const listenGameStart = () => {
    startBtn.addEventListener("click", () => {
        startBtn.setAttribute("transparent", "");
        startBtn.setAttribute("disabled", "");
        startGame();
    });
};

const main = () => {
    setRandomBlockSizes();
    disableBlocks();
    cleanData();
    listenDragEvent();
    listenGameStart();
};
main();