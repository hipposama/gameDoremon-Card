const socket = io();

document.getElementById('createRoomBtn').addEventListener('click', () => {
    const roomCode = generateRoomCode();
    socket.emit('createRoom', roomCode);
    document.getElementById('roomCodeDisplay').style.display = 'block';
    document.getElementById('roomCode').innerText = roomCode;
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    document.getElementById('roomCodeInput').style.display = 'block';
    document.getElementById('confirmJoinBtn').style.display = 'block';
});

document.getElementById('confirmJoinBtn').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCodeInput').value;
    socket.emit('joinRoom', roomCode);
});

socket.on('roomCreated', (roomCode) => {
    document.getElementById('createRoomBtn').style.display = 'none';
    document.getElementById('joinRoomBtn').style.display = 'none';
    document.getElementById('roomCodeInput').style.display = 'none';
    document.getElementById('confirmJoinBtn').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('leaveRoomBtn').style.display = 'block';
    document.getElementById('resetDeckBtn').style.display = 'block';
    document.getElementById('roomCode').innerText = roomCode;
    document.getElementById('deckCountDisplay').style.display = 'block';
    updateDeckCount(roomCode);
    resetCardDisplay();
});

socket.on('roomJoined', (roomCode) => {
    document.getElementById('createRoomBtn').style.display = 'none';
    document.getElementById('joinRoomBtn').style.display = 'none';
    document.getElementById('roomCodeInput').style.display = 'none';
    document.getElementById('confirmJoinBtn').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('leaveRoomBtn').style.display = 'block';
    document.getElementById('resetDeckBtn').style.display = 'block';
    document.getElementById('roomCode').innerText = roomCode;
    document.getElementById('deckCountDisplay').style.display = 'block';
    updateDeckCount(roomCode);
    resetCardDisplay();
});

document.getElementById('leaveRoomBtn').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCode').innerText;
    socket.emit('leaveRoom', roomCode);
    document.getElementById('createRoomBtn').style.display = 'block';
    document.getElementById('joinRoomBtn').style.display = 'block';
    document.getElementById('roomCodeInput').style.display = 'none';
    document.getElementById('confirmJoinBtn').style.display = 'none';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('leaveRoomBtn').style.display = 'none';
    document.getElementById('resetDeckBtn').style.display = 'none';
    document.getElementById('roomCodeDisplay').style.display = 'none';
    document.getElementById('deckCountDisplay').style.display = 'none';
    resetCardDisplay();
});

document.getElementById('cardDisplay').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCode').innerText;
    console.log(`Drawing card in room: ${roomCode}`);
    socket.emit('drawCard', roomCode);
});

document.getElementById('resetDeckBtn').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCode').innerText;
    socket.emit('resetDeck', roomCode);
});

socket.on('cardDrawn', (card) => {
    const cardDisplay = document.getElementById('cardDisplay');
    const cardElement = createCardElement(card.rank, card.suit);

    cardDisplay.innerHTML = '';
    cardDisplay.appendChild(cardElement);

    showCardRule(card.rank);

    updateDeckCount(document.getElementById('roomCode').innerText);
});

socket.on('updateDeckCount', (count) => {
    document.getElementById('deckCount').innerText = `${count}`;
});

socket.on('deckReset', () => {
    resetCardDisplay();
    updateDeckCount(document.getElementById('roomCode').innerText);
});

socket.on('error', (message) => {
    alert(message);
});

function generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function createCardElement(rank, suit) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.classList.add(`rank-${rank.toLowerCase()}`);
    cardDiv.classList.add(suit); // Add suit class to change colors
    cardDiv.classList.add('playingCards');
    cardDiv.classList.add('simpleCards');

    const suitSymbol = getSuitSymbol(suit);

    const topLeft = document.createElement('div');
    topLeft.classList.add('top-left');
    const rankDiv = document.createElement('div');
    rankDiv.classList.add('rank');
    rankDiv.innerText = rank;
    const suitDiv = document.createElement('div');
    suitDiv.classList.add('suit');
    suitDiv.innerHTML = suitSymbol;
    topLeft.appendChild(rankDiv);
    topLeft.appendChild(suitDiv);

    const bottomRight = document.createElement('div');
    bottomRight.classList.add('bottom-right');
    const rankDiv2 = document.createElement('div');
    rankDiv2.classList.add('rank');
    rankDiv2.innerText = rank;
    const suitDiv2 = document.createElement('div');
    suitDiv2.classList.add('suit');
    suitDiv2.innerHTML = suitSymbol;
    bottomRight.appendChild(rankDiv2);
    bottomRight.appendChild(suitDiv2);

    // Add center content for cards
    const center = document.createElement('div');
    center.classList.add('center');
    if (rank === 'A') {
        const suitSpan = document.createElement('span');
        suitSpan.innerHTML = suitSymbol;
        suitSpan.classList.add('large-suit');
        center.appendChild(suitSpan);
    } else if (rank === 'J') {
        const jackSpan = document.createElement('span');
        jackSpan.classList.add('jack');
        jackSpan.innerHTML = '&#9814;'; // Unicode for ♖
        center.appendChild(jackSpan);
    } else if (rank === 'Q') {
        const queenSpan = document.createElement('span');
        queenSpan.classList.add('queen');
        queenSpan.innerHTML = '&#9812;'; // Unicode for ♚
        center.appendChild(queenSpan);
    } else if (rank === 'K') {
        const kingSpan = document.createElement('span');
        kingSpan.classList.add('king');
        kingSpan.innerHTML = '&#9813;'; // Unicode for ♛
        center.appendChild(kingSpan);
    } else {
        const positions = getCardPositions(rank);
        positions.forEach(pos => {
            const suitSpan = document.createElement('span');
            suitSpan.innerHTML = suitSymbol;
            suitSpan.style.gridRow = pos[0];
            suitSpan.style.gridColumn = pos[1];
            center.appendChild(suitSpan);
        });
    }

    // Remove background image when displaying the card
    cardDiv.style.backgroundImage = 'none';

    cardDiv.appendChild(topLeft);
    cardDiv.appendChild(bottomRight);
    cardDiv.appendChild(center);

    return cardDiv;
}

function getCardPositions(rank) {
    const positions = {
        '2': [[3, 3], [5, 3]],
        '3': [[3, 3], [4, 3], [5, 3]],
        '4': [[3, 2], [3, 4], [5, 2], [5, 4]],
        '5': [[2, 2], [2, 4], [4, 3], [6, 2], [6, 4]],
        '6': [[2, 2], [2, 4], [4, 2], [4, 4], [6, 2], [6, 4]],
        '7': [[2, 2], [2, 4], [4, 2], [4, 4], [6, 2], [6, 4], [3, 3]],
        '8': [[2, 2], [2, 4], [3, 2], [3, 4], [5, 2], [5, 4], [6, 2], [6, 4]],
        '9': [[2, 2], [2, 4], [3, 2], [3, 4], [4, 3], [5, 2], [5, 4], [6, 2], [6, 4]],
        '10': [[2, 2], [2, 4], [3, 2], [3, 4], [4, 2], [4, 4], [5, 2], [5, 4], [6, 2], [6, 4]]
    };
    return positions[rank] || [];
}

function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts':
            return '&hearts;';
        case 'diamonds':
            return '&diams;';
        case 'clubs':
            return '&clubs;';
        case 'spades':
            return '&spades;';
        default:
            return '';
    }
}

function resetCardDisplay() {
    const cardDisplay = document.getElementById('cardDisplay');
    cardDisplay.innerHTML = '';
    cardDisplay.style.background = 'radial-gradient(circle, lightgreen, green)';
}

function updateDeckCount(roomCode) {
    socket.emit('updateDeckCount', roomCode);
}

function showCardRule(rank) {
    const cardRuleDisplay = document.getElementById('cardRuleDisplay');
    let message = "";
    switch (rank) {
        case 'A':
            message = "A: กินคนเดียวแบบเหงาๆ";
            break;
        case '2':
            message = "2: เลือกเพื่อนกินด้วยได้ 1 คน";
            break;
        case '3':
            message = "3: เลือกเพื่อนกินด้วยได้ 2 คน";
            break;
        case '4':
            message = "4: คนที่นั่งฝั่งซ้ายคนจับไพ่นี้ต้องกิน";
            break;
        case '5':
            message = "5: กินรอบวง";
            break;
        case '6':
            message = "6: คนที่นั่งฝั่งขวาคนจับไพ่นี้ต้องกิน";
            break;
        case '7':
            message = "7: เกมเกี่ยวกับเลข\n(เลขอันตราย,เลขหารเลขซ้ำ,นับลำดับ)";
            break;
        case '8':
            message = "8: พักยก";
            break;
        case '9':
            message = "9: มินิเกมแล้วแต่คนจับได้คิด\n(พูดชื่อหัวข้อ,ต่อคำซ้ำ,ต่อเพลง)";
            break;
        case '10':
            message = "10: ทาแป้ง\n(ถ้าไม่มีแป้งหมดแก้ว)";
            break;
        case 'J':
            message = "J: จับหน้า\n(ใครจับหน้าตามคนสุดท้ายกิน)";
            break;
        case 'Q':
            message = "Q: เพื่อนไม่คบ\n(ใครคุยด้วยกิน)";
            break;
        case 'K':
            message = "K: ทำตามที่ตกลงกันไว้";
            break;
        default:
            message = "";
    }
    cardRuleDisplay.innerText = message;
}
