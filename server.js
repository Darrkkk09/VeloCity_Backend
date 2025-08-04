const http = require('http');
const app = require('./app');
const cors = require('cors');
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

// app.use(cors({
//   origin: ['http://localhost:5173'],
//   methods: ['GET', 'POST'],
//   credentials: true
// }));

initializeSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});