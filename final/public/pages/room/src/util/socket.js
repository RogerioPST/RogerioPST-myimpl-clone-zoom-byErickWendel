//vai permitir o client se comunicar c o server
//padrao de projeto build
class SocketBuilder {
    constructor({ socketUrl }) {
        this.socketUrl = socketUrl
        this.onUserConnected = () => { }
        this.onUserDisconnected = () => { }
		}
//padrao de projeto build - ele q vai ter a funcao chamada, vai popular o atributo do objeto 
//e devolver o objeto p a business usar						
    setOnUserConnected(fn) {
        this.onUserConnected = fn

        return this
		}
//padrao de projeto build - ele q vai ter a funcao chamada, vai popular o atributo do objeto 
//e devolver o objeto p a business usar				
    setOnUserDisconnected(fn) {
        this.onUserDisconnected = fn
        return this
    }
//padrao de projeto build - ele q vai preparar e retornar o objeto p a business usar
    build() {
//vai permitir o client se comunicar c o server	
//esse "io" abaixo vem do arquivo index.html c a tag 'script src=socket.io...'		
//o client vai se conectar c o server - socketUrl eh o endereço do servidor do projeto server 'localhost:3000'
        const socket = io.connect(this.socketUrl, {
            withCredentials: false
        })
//escuto/ouço os eventos q o servidor pode emitir, no caso, somente esses abaixo
        socket.on('user-connected', this.onUserConnected)
        socket.on('user-disconnected', this.onUserDisconnected)

        return socket
    }
}
