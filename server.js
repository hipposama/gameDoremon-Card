const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', (roomCode) => {
        rooms[roomCode] = { players: [], deck: shuffleDeck(createDeck()) };
        socket.join(roomCode);
        rooms[roomCode].players.push(socket.id);
        io.to(socket.id).emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode]) {
            socket.join(roomCode);
            rooms[roomCode].players.push(socket.id);
            io.to(socket.id).emit('roomJoined', roomCode);
        } else {
            io.to(socket.id).emit('error', 'Room does not exist');
        }
    });

    socket.on('drawCard', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].deck.length > 0) {
            const card = rooms[roomCode].deck.pop();
            io.to(roomCode).emit('cardDrawn', card);
            io.to(roomCode).emit('updateDeckCount', rooms[roomCode].deck.length);
        } else {
            io.to(socket.id).emit('error', 'No cards left in the deck');
        }
    });

    socket.on('resetDeck', (roomCode) => {
        if (rooms[roomCode]) {
            rooms[roomCode].deck = shuffleDeck(createDeck());
            io.to(roomCode).emit('deckReset');
            io.to(roomCode).emit('updateDeckCount', rooms[roomCode].deck.length);
        } else {
            io.to(socket.id).emit('error', 'Room does not exist');
        }
    });

    socket.on('leaveRoom', (roomCode) => {
        if (rooms[roomCode]) {
            let index = rooms[roomCode].players.indexOf(socket.id);
            if (index !== -1) {
                rooms[roomCode].players.splice(index, 1);
                socket.leave(roomCode);
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode];
                }
            }
        }
    });

    socket.on('disconnect', () => {
        for (let roomCode in rooms) {
            let index = rooms[roomCode].players.indexOf(socket.id);
            if (index !== -1) {
                rooms[roomCode].players.splice(index, 1);
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode];
                }
                break;
            }
        }
    });
});

function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    suits.forEach((suit) => {
        ranks.forEach((rank) => {
            deck.push({ suit, rank });
        });
    });
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
