//Pra quem não tem webcam (como eu), eu estou usando o Firefox Developer Edition. Digite about:config na barra de pesquisa e procure por media.navigator.streams.fake e coloque como True.
//essa classe eh responsavel por td q for media do browser: pelo audio, video , camera, compartilhamento de tela
class Media {
//por padrao, sempre c audio	
    async getCamera(audio = true, video = true) {
        return navigator.mediaDevices.getUserMedia({
            video,
            audio
        })
    }
}