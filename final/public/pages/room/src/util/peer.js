/*
o peer-server eh como se fosse o numero de telefone p cada um dos usuarios!

n vamos usar a api publica de webrtc do browser, mas sim a lib peerjs, q esta no projeto peer-server
-webrtc - web real time communication  entre web browsers e aplicacoes mobile - visa compartilhar dados de video, audio()
os dados de stream, como audio e video sao trafegados entre clientes) via p2p (peer to peer) p ligar c complexidades como
firewall, antivirus, mas msm assim precisa do
websocket, socket.io p saber o endereço dos clientes, gerenciar, q eh o q esta no projeto server c socket.io!

o padrao webrtc pode usar o Interactive Connectivity Establishment ou ICE Framework p resolver complexidade de 
acesso de rede no mundo real, ou seja, procura a forma mais facil p q dois computadores consigam se comunicar em rede peer to peer.
vamos usar um servidor ICE publico disponibilizado pelo google, mas poderia subir um numa maquina virtual.
Como contingencia, se a conexao p2p falhar, podemos estabelecer a conexao pelos nossos proprios servidores dedicados.
STUN server serve p obter o end externo de rede do cliente conectado e descobrir a id publica dos clientes o q eh necessario p
conexao e é opcional na hr de configurar
o projeto webrtc. o ICE tenta criar uma conexao obtendo o endereço do host obtido na conexao. se ele n conseguir acessar, ele obtem o end publico do
host pelo STUN server e se ele n conseguir acessar, vai rotear/garantir o trafego de msg e streams a partir de um TURN relay server (usado p garantir a conexao entre
os clientes se houver falha; tb eh um STUN server c mais funcionalidades)
A ideia do peerJS eh se certificar q os clientes conectador possuem um identificador e q seja unico, abstrai a complexidade dos eventos do webrtc!

▸ PeerServer: https://github.com/peers/peerjs-server
▸ PeerJS: https://peerjs.com/docs.html#api
▸ Deploying STUN and TURN servers (procure por este título no Link): https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
▸ Browsers Compatíveis com Media Devices: https://caniuse.com/mdn-api_mediadevices_getusermedia
▸ Browsers Compatíveis com WebRTC: https://caniuse.com/?search=webrtc

LEITURA COMPLEMENTAR

▸ WebRTC Basics: https://www.html5rocks.com/en/tutorials/webrtc/basics/
▸ WebRTC Infrastructure: https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
▸ Node Turn: https://github.com/Atlantis-Software/node-turn
▸ O tipo Map: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
▸ Making a Simple P2P Web Game: https://www.toptal.com/webrtc/taming-webrtc-with-peerjs
*/

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
//qdo conseguir estabilizar uma conexao com o servidor
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
			//qdo chega o stream ou video do usuario q mandou p a gente
				call.on('stream', stream => this.onPeerStreamReceived(call, stream))
//a gente n passa a funcao direto, pq a gente quer saber tb de quem eh a call q deu erro				
        call.on('error', error => this.onCallError(call, error))
        call.on('close', _ => this.onCallClose(call))

        this.onCallReceived(call)
    }

//adicionar o comportamento dos eventos de call tambem para quem ligar!!!!	
//a gente tem o peer.oncall
//teria q ter, por ex, um call.oncall
    _preparePeerInstanceFunction(peerModule) {
//ao inves de substituir a instancia global, vamos extender ela			
        class PeerCustomModule extends peerModule {}
//vou substituir a call que vem la do peer
        const peerCall = PeerCustomModule.prototype.call 
				const context = this
//sobreescrevendo a funcao call de dentro do peer
        PeerCustomModule.prototype.call = function (id, stream) {
//independente do q aconteça, ja chama o q ele chamava antes					
            const call = peerCall.apply(this, [ id, stream ])
// aqui acontece a magia, interceptamos o call e adicionamos todos os eventos
//  da chamada para quem liga também, pq qdo duplicamos a aba do navegador, n estava mostrando a chamada do outro
//usuario, e sim apenas a minha; sobreescrevemos entao p eu tb receber a stream de quem me ligou!
            context._prepareCallEvent(call)

            return call
        }

        return PeerCustomModule
    }

    build() {
			const PeerCustomInstance = this._preparePeerInstanceFunction(Peer)
//o spread operator, nesse caso, values retorna um array e vai dividir dentro do obj
//const peer = new Peer(...this.peerConfig)        
        const peer = new PeerCustomInstance(...this.peerConfig)
//de acordo c a doc de peerjs, eventos 'error', 'call'
				peer.on('error', this.onError)
//no caso de call, quero capturar outros eventos, como o q aconteceu qdo a chamada terminou, começou, desconectou
//passo o bind(this) p manter o contexto dessa classe dentro da funcao passada 
        peer.on('call', this._prepareCallEvent.bind(this))

        return new Promise(resolve => peer.on('open', id => {
            this.onConnectionOpened(peer)
            return resolve(peer)
        }))
    }
}
