/*
servidor p signaling = coordenacao da comunicacao 
essa classe vai gerenciar/saber o q os usuarios estao fazendo na plataforma 

//o web socket vai saber qdo o cliente entrar, desconectar de uma call, ele vai saber e compartilhar esses eventos
// p tornar mais seguro, Você pode colocar credenciais, limitar domínios, validar quantidade de eventos e táticas para evitar ataques.
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

//para cada cliente especifico, a gente vai ter um socket especifico
io.on('connection', socket => {
		console.log('connection', socket.id)
//qdo um usuario quiser se conectar, ele vai entrar em uma sala, ou seja, vai emitir do front-end um evento
//'join-room'
//vai ser criada uma sala virtualmente		
    socket.on('join-room', (roomId, userId) => {
        
// adiciona os usuarios na mesma sala e todos q chegarem nessa mesma sala, vao receber eventos - sala de conferencia
				socket.join(roomId)
//qdo chegar um usuario novo, vou notificar p todos q tem um usuario novo	e isso vai passar a msg 
// "tem um usuario novo, liga p ele, se conecta c ele tb"	
				socket.to(roomId).broadcast.emit('user-connected', userId)
//qdo desconectar, tb vou notificar td mundo				
        socket.on('disconnect', () => {
						console.log('disconnected!', roomId, userId)
//e isso vai passar a msg "usuario desconectou, desliga a ligacao, se desconecta dele tb"							
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

const startServer = () => {
    const { address, port } = server.address()
    console.info(`app running at ${address}:${port}`)
}

server.listen(process.env.PORT || 3000, startServer)