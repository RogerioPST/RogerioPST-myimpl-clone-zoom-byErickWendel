//qdo chegar um usuario novo p fazer uma call, qual eh a regra?
//vamos resolver aqui
//orquestra todas as requisicoes
//n tem permissao p atualizar o HTML
//a unica q tem eh a VIEW
class Business {
    constructor({ room, media, view, socketBuilder, peerBuilder }) {
        this.room = room
        this.media = media
        this.view = view

        this.socketBuilder = socketBuilder
        this.peerBuilder = peerBuilder
//enquanto a camera estiver ligada , ela tem uma corrente de dados chegando.
        this.socket = {}
        this.currentStream = {}
        this.currentPeer = {}
        
        this.peers = new Map()
        this.usersRecordings = new Map()
    }
    static initialize(deps) {
        const instance = new Business(deps)
        return instance._init()
    }
    async _init() {
//vai inicializar td q eh dependencia da classe, registrar os eventos
//mas quem for chamar a business, vai chamar por um metodo estatico			
        this.view.configureRecordButton(this.onRecordPressed.bind(this))
        this.view.configureLeaveButton(this.onLeavePressed.bind(this))
//p testar o audio, passar await this.media.getCamera(true)
        this.currentStream = await this.media.getCamera()
        this.socket = this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .build()

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onPeerCallReceived())
            .setOnPeerStreamReceived(this.onPeerStreamReceived())
            .setOnCallError(this.onPeerCallError())
            .setOnCallClose(this.onPeerCallClose())
            .build()
//this.addVideoStream('test01')
				this.addVideoStream(this.currentPeer.id)
//console.log('init!!!', this.currentStream)				
    }
//por enquanto, vou mostrar a minha camera, mas qdo me ligarem de volta, quero mostrar a da pessoa
    addVideoStream(userId, stream = this.currentStream) {
        const recorderInstance = new Recorder(userId, stream)
        this.usersRecordings.set(recorderInstance.filename, recorderInstance)
        if(this.recordingEnabled) {
            recorderInstance.startRecording()
        }
//se o usuario passado for eu, numa ligacao, n quero ouvir o meu audio
        const isCurrentId = userId === this.currentPeer.id
        this.view.renderVideo({
            userId,
						stream,
//muted: false, //qdo quiser testar, descomentar o muted aqui						
            isCurrentId
        })
    }

    onUserConnected () {
        return userId => {
            console.log('user connected!', userId)
            this.currentPeer.call(userId, this.currentStream)
        }
    }

    onUserDisconnected () {
        return userId => {
            console.log('user disconnected!', userId)

            if(this.peers.has(userId)) {
                this.peers.get(userId).call.close()
                this.peers.delete(userId)
            }

            this.view.setParticipants(this.peers.size)
            this.stopRecording(userId)

            this.view.removeVideoElement(userId)
        }
    }

    onPeerError () {
        return error => {
            console.error('error on peer!', error)
        }
    }
    onPeerConnectionOpened () {
        return (peer) => {
            const id = peer.id
						console.log('peer!!', peer)
//this.socket.emit('join-room', this.room, 'teste01')	
            this.socket.emit('join-room', this.room, id)
        }
    }
    onPeerCallReceived () {
        return call => {
            console.log('answering call', call)
            call.answer(this.currentStream)
        }
    }

    onPeerStreamReceived () {
        return (call, stream ) => {
						const callerId = call.peer 
						//console.log('call received!!', calledId)	
//issue? call on stream event receives same remote stream twice #609											
//devido a uma issue por causa de um bug no peerjs q considera video + audio como duas ligacoes, 
//precisa ignorar a segunda chamada 						
            if(this.peers.has(callerId)) {
                console.log('calling twice, ignoring second call...', callerId)
                return;
            }
            
            this.addVideoStream(callerId, stream)
            this.peers.set(callerId, { call })
            
            this.view.setParticipants(this.peers.size)
        }
    }

    onPeerCallError () {
        return (call, error) => {
            if(this.peers.has(userId)) {
                this.peers.get(userId).call.close()
                this.peers.delete(userId)
            }
            this.view.setParticipants(this.peers.size)

						console.log('an call error ocurred!', error)
//call.peer eh o id do cliente						
            this.view.removeVideoElement(call.peer)
        }
    }

    onPeerCallClose () {
        return (call) => {
            console.log('call closed!!', call.peer)
        }
    }

    onRecordPressed(recordingEnabled) {
        this.recordingEnabled = recordingEnabled
        console.log('pressionou!!', recordingEnabled)
        for( const [key, value] of this.usersRecordings) {
            if(this.recordingEnabled) {
                value.startRecording()
                continue;
            }
            this.stopRecording(key)
        }
        
    }

// se um usuario entrar e sair da call durante uma gravançao
// precisamos parar as gravacoes anteriores dele
    async stopRecording(userId) {
        const usersRecordings = this.usersRecordings
        for( const [ key, value] of usersRecordings) {
            const isContextUser = key.includes(userId)
            if(!isContextUser) continue;

            const rec = value 
            const isRecordingActive = rec.recordingActive 
            if(!isRecordingActive)  continue;

            await rec.stopRecording()
            this.playRecordings(key)
        }
    }
//p dar um play na tela
    playRecordings(userId) {
//userRecordings nd mais sao do q nossas instancias de recordings			
				const user = this.usersRecordings.get(userId)
//pegar as urls do usuario, pq ele pode ter entrado e saído várias vezes				
				const videosURLs = user.getAllVideoURLs()
//dessa vez n vai renderizar por stream, mas sim por url.
//tem url, soh vai dar play no video				
        videosURLs.map(url => {
            this.view.renderVideo({ url, userId })
        })
    }

    onLeavePressed() {
		//value eh do arquivo recorder.js	, nesse caso
        this.usersRecordings.forEach((value, key) => value.download())
    }
}