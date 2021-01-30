class PeerBuilder {
    constructor({ peerConfig }) {
        this.peerConfig = peerConfig

        const defaultFunctionValue = () => { }
        this.onError = defaultFunctionValue
        this.onCallReceived = defaultFunctionValue
        this.onConnectionOpened = defaultFunctionValue
        this.onPeerStreamReceived = defaultFunctionValue
        this.onCallError = defaultFunctionValue
        this.onCallClose = defaultFunctionValue
    }
    setOnCallError(fn) {
        this.onCallError = fn 

        return this
    }

    setOnCallClose(fn) {
        this.onCallClose = fn 

        return this
    }
    setOnError(fn) {
        this.onError = fn

        return this
    }
    setOnCallReceived(fn) {
        this.onCallReceived = fn

        return this
    }

    setOnConnectionOpened(fn) {
        this.onConnectionOpened = fn

        return this
    }
//qdo eu conseguir receber/conectar p receber o video, audio do outro usuario, vou delegar uma funcao
    setOnPeerStreamReceived(fn) {
        this.onPeerStreamReceived = fn

        return this
    }

    _prepareCallEvent(call) {
        call.on('stream', stream => this.onPeerStreamReceived(call, stream))
        call.on('error', error => this.onCallError(call, error))
        call.on('close', _ => this.onCallClose(call))

        this.onCallReceived(call)
    }

//adicionar o comportamento dos eventos de call tambem para quem ligar!!!!	
    _preparePeerInstanceFunction(peerModule) {
        class PeerCustomModule extends peerModule {}
//vou substituir a call que vem la do peer
        const peerCall = PeerCustomModule.prototype.call 
				const context = this
//sobreescrevendo a funcao call 
        PeerCustomModule.prototype.call = function (id, stream) {
            const call = peerCall.apply(this, [ id, stream ])
// aqui acontece a magia, interceptamos o call e adicionamos todos os eventos
//  da chamada para quem liga também
            context._prepareCallEvent(call)

            return call
        }

        return PeerCustomModule
    }

    build() {
//o spread operator, nesse caso, values retorna um array e vai dividir dentro do obj
//const peer = new Peer(...this.peerConfig)        
        const PeerCustomInstance = this._preparePeerInstanceFunction(Peer)
        const peer = new PeerCustomInstance(...this.peerConfig)
//de acordo c a doc de peerjs, eventos 'error', 'call'
				peer.on('error', this.onError)
//no caso de call, quero capturar outros eventos, como o q aconteceu qdo a chamada terminou, começou, desconectou
        peer.on('call', this._prepareCallEvent.bind(this))

        return new Promise(resolve => peer.on('open', id => {
            this.onConnectionOpened(peer)
            return resolve(peer)
        }))
    }
}
