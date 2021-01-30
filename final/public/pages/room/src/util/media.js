class Media {
//por padrao, sempre c audio	
    async getCamera(audio = true, video = true) {
        return navigator.mediaDevices.getUserMedia({
            video,
            audio
        })
    }
}