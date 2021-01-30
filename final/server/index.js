const server = require('http').createServer((request, response) => {
//habilitando o CORS	
    response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    })
    response.end('hey there!')
})

const socketIo = require('socket.io')
const io = socketIo(server, {
    cors: {
        origin: '*',
        credentials: false
    }
})

io.on('connection', socket => {
		console.log('connection', socket.id)
//vai ser criada uma sala virtualmente		
    socket.on('join-room', (roomId, userId) => {
        
// adiciona os usuarios na mesma sala
				socket.join(roomId)
//tudo mto q chegar, vou notificar p todos q tem um usuario novo		
				socket.to(roomId).broadcast.emit('user-connected', userId)
//qdo desconectar, tb vou notificar td mundo				
        socket.on('disconnect', () => {
            console.log('disconnected!', roomId, userId)
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

const startServer = () => {
    const { address, port } = server.address()
    console.info(`app running at ${address}:${port}`)
}

server.listen(process.env.PORT || 3000, startServer)