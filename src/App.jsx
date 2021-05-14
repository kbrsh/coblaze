import React, { useState, useEffect, useRef } from "react"
import MapChart from "./MapChart"
import Icon from "./Icon"
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

const formatConfidence = confidence =>
	Math.round(confidence * 100 * 100) / 100 + "%"
const formatLat = lat => lat + (lat < 0 ? "° S" : "° N")
const formatLong = long => long + (long < 0 ? "° W" : "° E")

const updateSource = (
	i,
	data,
	setData,
	activity,
	setActivity,
	videosElement,
	canvasElement
) => {
	const videoElements = videosElement.getElementsByClassName("stream-video")
	const ctx = canvasElement.getContext("2d")
	const source = data[i]
	const videoElement = videoElements[source.id]
	ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
	return predict(
		ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)
	)
		.then(result => {
			result = result.Confidences
			const key = Object.keys(result).reduce((a, b) =>
				result[a] > result[b] ? a : b
			)
			const keyPrev = data[source.id].key
			const sourceNew = { ...data[source.id], key, confidence: result[key] }

			return {
				data: [
					...data.slice(0, source.id),
					sourceNew,
					...data.slice(source.id + 1)
				],
				activity:
					keyPrev === "nofire" && key === "fire"
						? [...activity, sourceNew]
						: keyPrev === "fire" && key === "nofire"
						? [...activity, sourceNew]
						: activity
			}
		})
		.then(({ data, activity }) => {
			i += 1
			setData(data)
			setActivity(activity)
			if (i < data.length) {
				updateSource(
					i,
					data,
					setData,
					activity,
					setActivity,
					videosElement,
					canvasElement
				)
			} else {
				setTimeout(() => {
					updateSource(
						0,
						data,
						setData,
						activity,
						setActivity,
						videosElement,
						canvasElement
					)
				}, 1000)
			}
		})
}

function App() {
	const [data, setData] = useState([
		{
			id: 0,
			src: "./videos/Forestfire.mp4",
			location: "Dublin, CA",
			lat: 37.7159,
			long: -121.9101,
			key: "nofire",
			confidence: 0
		},
		{
			id: 1,
			src: "./videos/Forest.mp4",
			location: "Los Angeles, CA",
			lat: 34.0522,
			long: -118.2437,
			key: "nofire",
			confidence: 0
		}
	])
	const [activity, setActivity] = useState([])
	const videosRef = useRef()
	const canvasRef = useRef()

	useEffect(() => {
		const videosElement = videosRef.current
		const canvasElement = canvasRef.current

		if (videosElement && canvasElement) {
			load().then(() => {
				updateSource(
					0,
					data,
					setData,
					activity,
					setActivity,
					videosElement,
					canvasElement
				)
			})
		}
	}, [])

	return (
		<div className="container">
			<h1>coblaze</h1>
			<div className="activity-container">
				<h5>ACTIVITY</h5>
				{activity.map(source => (
					<div key={source.id.toString()} className="activity-alert">
						<svg height={40} width={40} className="activity-icon">
							<Icon type={source.key} height={40} width={40} />
						</svg>
						<p className="activity-info">
							{source.key === "fire"
								? "Wildfire detected in"
								: "Wildfire extinguished in"}{" "}
							{source.location} with{" "}
							{formatConfidence(source.confidence)} confidence.
						</p>
						<p className="activity-coordinates">
							{formatLat(source.lat)}, {formatLong(source.long)}
						</p>
					</div>
				))}
			</div>
			<MapChart markers={data} />
			<div ref={videosRef} className="stream-container">
				{data.map(source => (
					<div key={source.id.toString()} className="stream">
						<video
							className="stream-video"
							src={source.src}
							width={250}
							height={250}
							autoPlay={true}
							muted={true}
						/>
						<p className="stream-location">
							{source.location} ({formatLat(source.lat)},{" "}
							{formatLong(source.long)})
						</p>
						<p className="stream-status">
							{source.key === "fire"
								? "Wildfire detected with"
								: "No wildfire detected with"}{" "}
							{formatConfidence(source.confidence)} confidence.
						</p>
					</div>
				))}
			</div>
			<canvas id="canvas" ref={canvasRef} width={250} height={250} />
		</div>
	)
}

export default App
