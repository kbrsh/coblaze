import React, { useState, useRef } from "react"
import Worker from "./worker?worker"

const model = Worker()

const load = () => {
	model.postMessage(["load", "/model/signature.json", "/model/model.json"])
}

const dispose = () => {
	model.postMessage(["dispose"])
}

const predict = data => {
	model.postMessage(["predict", data])
	return new Promise(resolve => {
		model.onmessage = e => {
			resolve(e.data)
		}
	})
}

load()

function App() {
	const [prediction, setPrediction] = useState({})
	const videoRef = useRef()
	const canvasRef = useRef()
	const loop = () => {
		const videoElement = videoRef.current
		const canvasElement = canvasRef.current

		if (videoElement && canvasElement && !videoElement.paused && !videoElement.ended) {
			const ctx = canvasElement.getContext("2d")
			ctx.drawImage(videoElement, 0, 0)
			predict(ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)).then(data => {
				const key = Object.keys(data.Confidences).reduce((a, b) => data.Confidences[a] > data.Confidences[b] ? a : b)
				setPrediction({
					key,
					confidence: data.Confidences[key]
				})
			})
		}
	}
	loop()

	return (
		<div>
			<h1>coblaze</h1>
			<video ref={videoRef} src="./videos/Forestfire.mp4" controls={true} onPlay={loop}/>
			<canvas ref={canvasRef}/>
			<p>{prediction.key} {prediction.confidence}</p>
		</div>
	)
}

export default App
