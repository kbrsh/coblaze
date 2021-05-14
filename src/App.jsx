import React, { useState, useEffect, useRef } from "react"
import Worker from "./worker?worker"

const model = Worker()

const load = () => {
	model.postMessage(["load", "/model/signature.json", "/model/model.json"])
	return new Promise(resolve => {
		model.onmessage = resolve
	})
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

const formatConfidence = confidence => Math.round(confidence * 100 * 100) / 100 + "%"

const updateSource = (i, data, setData, videosElement, canvasElement) => {
	const videoElements = videosElement.getElementsByClassName("video-source")
	const ctx = canvasElement.getContext("2d")
	const source = data[i]
	const videoElement = videoElements[source.id]
	ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
	return predict(ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)).then(result => {
		result = result.Confidences
		const key = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b)
		return [
			...data.slice(0, source.id),
			{...data[source.id], key, confidence: result[key]},
			...data.slice(source.id + 1)
		];
	}).then(data => {
		i += 1
		setData(data)
		if (i < data.length) {
			updateSource(i, data, setData, videosElement, canvasElement)
		} else {
			setTimeout(() => {
				updateSource(0, data, setData, videosElement, canvasElement)
			}, 1000)
		}
	})
}

function App() {
	const [data, setData] = useState([
		{id: 0, src: "./videos/Forestfire.mp4", location: "Dublin, CA", lat: 1, long: -1, key: "Unknown", confidence: 0},
		{id: 1, src: "./videos/Forest.mp4", location: "Dublin, CA", lat: 1, long: -1, key: "Unknown", confidence: 0}
	])
	const [prediction, setPrediction] = useState({key: "Unknown", confidence: 0})
	const videosRef = useRef()
	const canvasRef = useRef()

	useEffect(() => {
		const videosElement = videosRef.current
		const canvasElement = canvasRef.current

		if (videosElement && canvasElement) {
			load().then(() => {
				updateSource(0, data, setData, videosElement, canvasElement)
			})
		}
	}, [])

	return (
		<div>
			<h1>coblaze</h1>
			<div ref={videosRef}>
				{ data.map(source =>
					<div key={source.id.toString()}>
						<p>{source.location} {source.key} {formatConfidence(source.confidence)}</p>
						<video className="video-source" src={source.src} width={250} height={250} autoPlay={true} muted={true}/>
					</div>
				)}
			</div>
			<canvas ref={canvasRef} width={250} height={250}/>
		</div>
	)
}

export default App
