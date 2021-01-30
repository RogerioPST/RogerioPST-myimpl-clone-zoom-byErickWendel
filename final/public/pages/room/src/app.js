/* const recordClick = function (recorderBtn) {
  this.recordingEnabled = false
  return () => {
    this.recordingEnabled = !this.recordingEnabled
    recorderBtn.style.color = this.recordingEnabled ? 'red' : 'white'
  }
} */

const onload = () => {
//window.location.search = "?room=147"
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  console.log('this is the room', room)

//const recorderBtn = document.getElementById('record')
//recorderBtn.addEventListener('click', recordClick(recorderBtn))	
// projeto da pasta server
  const socketUrl = 'http://localhost:3000'
// const socketUrl = 'https://boiling-eyrie-34493.herokuapp.com'
	const socketBuilder = new SocketBuilder({ socketUrl })
/*
//c undefined, o id será gerado pelo servidor
	new Peer(undefined, {
		port: 9000,
		host: 'localhost',
		path: '/',
	})
*/

//values retorna um array	
  const peerConfig = Object.values({
    id: undefined,
    config: {
		//projeto da pasta peer-server	
			// host: 'frozen-river-53219.herokuapp.com',
//define https e o heroku define a porta.nesse caso, comenta a linha ref a porta
      // secure: true,
      port: 9000,
      host: 'localhost',
      path: '/'
    }
  })
  const peerBuilder = new PeerBuilder({ peerConfig })

  const view = new View()
  const media = new Media()
  const deps = {
    view,
    media,
    room,
    socketBuilder,
    peerBuilder
  }

	Business.initialize(deps)
//view.renderVideo({ userId: 'test01', url: 'https://media.giphy.com/media/1pZ2kwvYvNMcX19x5z/giphy.mp4'})
//view.renderVideo({ userId: 'test01', isCurrentId: true, url: 'https://media.giphy.com/media/1pZ2kwvYvNMcX19x5z/giphy.mp4'})
//view.renderVideo({ userId: 'test01', url: 'https://media.giphy.com/media/1pZ2kwvYvNMcX19x5z/giphy.mp4'})

}

window.onload = onload