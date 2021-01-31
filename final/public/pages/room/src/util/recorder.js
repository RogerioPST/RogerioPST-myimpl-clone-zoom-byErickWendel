/*
poder do Media Recorder, a API do browser para gravação de grupos de usuários em videoconferências.

A gravacao eu enviava a cada 2 segundos pro back, no final eu disparava um evento e o back juntava tudo usando ffmpeg.
Via ajax, 2 segundo para nao ficar um arquivo pesado de upload.
EW: Boaaa sensacional! Daria para subir via stream (tenho um video aqui sobre upload de gigabytes de arquivos), eu acho excelente, só acho que pode ser meio difícil de sincronizar as coisas, mas é um desafio show de bola
I:entao, 2seg de gravacao deve dar apenas alguns kb, nao deve passar nem de 500kb, entao o upload fica bem leve e transparente. Enviar gigabytes, o problema eh o tempo, terminou a videoconferencia, vai levar quanto tempo pra fazer o upload saca? no back so guardar a ordem, depois informar a ordem para o ffmpeg q ele junta tudo, nem precisa de muito esforço.

 Browsers Compatíveis com o Media Recorder: https://caniuse.com/?search=media%20recorder
▸ Reposta no StackOverflow sobre Regex: http://bit.ly/3iQKt3v
LEITURA COMPLEMENTAR

▸ WebRTC Basics: https://www.html5rocks.com/en/tutorials/webrtc/basics/
▸ WebRTC Infrastructure: https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
▸ WebRTC Recording PeerConnection Examples: https://webrtc.github.io/samples/src/content/peerconnection/multiple/
▸ WebRTC & Media Recorder: https://webrtc.github.io/samples/src/content/getusermedia/record/

*/
class Recorder {
    constructor(userName, stream) {
        this.userName = userName
        this.stream = stream

				this.filename = `id:${userName}-when:${Date.now()}`
//p rodar esse tipo de video 'webm - web media', deve precisar instalar o vlc				
        this.videoType = 'video/webm'

        this.mediaRecorder = {}
        this.recordedBlobs = []
        this.completeRecordings = []
        this.recordingActive = false
    }
    _setup() {
        const commonCodecs = [
            "codecs=vp9,opus",
            "codecs=vp8,opus",
            ""
        ]

        const options = commonCodecs
            .map(codec => ({ mimeType: `${this.videoType};${codec}`}))
            .find(options => MediaRecorder.isTypeSupported(options.mimeType))
   //verifica quais codecs o browser suporta     
        if(!options) {
            throw new Error(`none of the codecs: ${commonCodecs.join(',')} are supported`)
        }

        return options
    }

    startRecording() {
        const options = this._setup()
// se nao estiver recebendo mais video, já ignora!
        if(!this.stream.active) return;
        this.mediaRecorder = new MediaRecorder(this.stream, options)
        console.log(`Created MediaRecorder ${this.mediaRecorder} with options ${options}`)

        this.mediaRecorder.onstop = (event) => {
            console.log('Recorded Blobs', this.recordedBlobs)
        }

        this.mediaRecorder.ondataavailable = (event) => {
            if(!event.data || !event.data.size) return; 

            this.recordedBlobs.push(event.data)
        }

        this.mediaRecorder.start()
        console.log(`Media Recorded started`, this.mediaRecorder)
        this.recordingActive = true

    }

    async stopRecording() {
        if(!this.recordingActive) return;
        if(this.mediaRecorder.state === "inactive") return;

        console.log('`media recorded stopped!', this.userName)
        this.mediaRecorder.stop()
        
        this.recordingActive = false 
				await Util.sleep(200)
//pensando em um pause e continue p n perder nd				
        this.completeRecordings.push([...this.recordedBlobs])
        this.recordedBlobs = []
    }

    getAllVideoURLs( ) {
        return this.completeRecordings.map(recording => {
//Blob eh da API do Browser
            const superBuffer = new Blob(recording, { type: this.videoType })
//vai gerar uma URL p a gente renderizar na tela
            return window.URL.createObjectURL(superBuffer)
        })
    }

    download() {
//se n terminou nenhuma gravacao, retorna			
        if(!this.completeRecordings.length) return;

        for(const recording of this.completeRecordings) {
            const blob = new Blob(recording, { type: this.videoType })
						const url = window.URL.createObjectURL(blob)
//vamos criar um link p simular um click p fazer o download automaticamente						
//vai ser um botao invisivel
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url 
            a.download = `${this.filename}.webm`
            document.body.appendChild(a)
            a.click()
        }
    }
}