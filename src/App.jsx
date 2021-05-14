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

const updateSource = (i, data, setData, activity, setActivity, videosElement, canvasElement) => {
	const videoElements = videosElement.getElementsByClassName("video-source")
	const ctx = canvasElement.getContext("2d")
	const source = data[i]
	const videoElement = videoElements[source.id]
	ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
	return predict(ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)).then(result => {
		result = result.Confidences
		const key = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b)
		const keyPrev = data[source.id].key
		const sourceNew = {...data[source.id], key, confidence: result[key]}

		return {
			data: [...data.slice(0, source.id), sourceNew, ...data.slice(source.id + 1)],
			activity: keyPrev === "nofire" && key === "fire" ?
				[...activity, {type: "fire", source: sourceNew}] :
				keyPrev === "fire" && key === "nofire" ?
					[...activity, {type: "nofire", source: sourceNew}] :
					activity
		}
	}).then(({data, activity}) => {
		i += 1
		setData(data)
		setActivity(activity)
		if (i < data.length) {
			updateSource(i, data, setData, activity, setActivity, videosElement, canvasElement)
		} else {
			setTimeout(() => {
				updateSource(0, data, setData, activity, setActivity, videosElement, canvasElement)
			}, 1000)
		}
	})
}

function App() {
	const [data, setData] = useState([
		{id: 0, src: "./videos/Forestfire.mp4", location: "Dublin, CA", lat: 1, long: -1, key: "nofire", confidence: 0},
		{id: 1, src: "./videos/Forest.mp4", location: "Dublin, CA", lat: 1, long: -1, key: "nofire", confidence: 0}
	])
	const [activity, setActivity] = useState([])
	const videosRef = useRef()
	const canvasRef = useRef()

	useEffect(() => {
		const videosElement = videosRef.current
		const canvasElement = canvasRef.current

		if (videosElement && canvasElement) {
			load().then(() => {
				updateSource(0, data, setData, activity, setActivity, videosElement, canvasElement)
			})
		}
	}, [])

	return (
		<div>
			<h1>coblaze</h1>
			<div>
				<h5>ACTIVITY</h5>
				{activity.map(alert =>
					<div>
						<h3>{alert.type}</h3>
						<p>{alert.source.location}</p>
					</div>
				)}
			</div>
			<div ref={videosRef}>
				{data.map(source =>
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
