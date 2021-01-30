class View {
    constructor() {
        this.recorderBtn = document.getElementById("record")
        this.leaveBtn = document.getElementById("leave")
    }

    createVideoElement({ muted = true, src, srcObject }) {
//no src, mostra uma vez, mas qdo estamos trabalhando c video sobre demanda, video ativo, 
//como eh a camera em q sempre ficam chegando informacoes, a gente pode usar o srcObject
        const video = document.createElement('video')
				video.muted = muted
//ou vai ser enviado src ou SrcObject				
        video.src = src
        video.srcObject = srcObject
//se passou src, a gente sabe q eh url. entao queremos controls
        if (src) {
//qdo eu clicar em stop, ja quero reproduzir na tela os videos q foram gravados.
            video.controls = true
						video.loop = true
//retornando direto o video, caso n tenha carregado e seja dado um play, dah erro
//p contornar isso, adiciona evento ou criar timeout (timeout n eh o melhor metodo)
            Util.sleep(200).then(_ => video.play())
        }

        if (srcObject) {
//qdo jah tiver carregado o header do arquivo, ja estiver preparado, ja pode dar play
            video.addEventListener("loadedmetadata", _ => video.play())
        }

        return video
    }

    renderVideo({ userId, stream = null, url = null, isCurrentId = false }) {
//sempre q um usuario entrar por uma call, vai diferenciar pelo userId
		//vai criar um novo elem de video a cada video q chegar, seja url ou stream e o não escolhido vai ficar null
        const video = this.createVideoElement({
//qdo eu ligar p vc, n quero ouvir o meu audio, apenas o seu!					
            muted: isCurrentId,
            src: url,
            srcObject: stream
        })
        this.appendToHTMLTree(userId, video, isCurrentId)
    }

    appendToHTMLTree(userId, video, isCurrentId) {
        const div = document.createElement('div')
        div.id = userId
        div.classList.add('wrapper')
        div.append(video)
				const div2 = document.createElement('div')
//verifica se eh um usuario corrente. pq?? se for eu vendo eu 
//msm, n quero q apareço meu nome. entao ocultamos
        div2.innerText = isCurrentId ? '' : userId
        div.append(div2)

        const videoGrid = document.getElementById('video-grid')
        videoGrid.append(div)
    }

    setParticipants(count) {
        const myself = 1
        const participants = document.getElementById('participants')
        participants.innerHTML = (count + myself)
    }

    removeVideoElement(id) {
        const element = document.getElementById(id)
        element.remove()
    }
    toggleRecordingButtonColor(isActive = true) {
        this.recorderBtn.style.color = isActive ? 'red' : 'white'
    }
    onRecordClick(command) {
        this.recordingEnabled = false
        return () => {
            const isActive = this.recordingEnabled = !this.recordingEnabled
            
            command(this.recordingEnabled)
            this.toggleRecordingButtonColor(isActive)
        }
    }
    onLeaveClick(command) {

        return async() => {

            command()
//gambiarra p dar tempo de o usuario dar 
//permissao p o browser de fazer o download de cada um dos itens, 
//varios arquivos ao msm tempo
//e dar tempo p redirecionar
            await Util.sleep(4000)
            window.location = '/pages/home'
        }   

		}
//a business vai delegar um comando
    configureRecordButton(command) {
        this.recorderBtn.addEventListener('click', this.onRecordClick(command))
    }
//qdo o usuario clicar p sair, a gente faz download de todos os arquivos pendentes
    configureLeaveButton(command) {
        this.leaveBtn.addEventListener('click', this.onLeaveClick(command))
    }
}