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

const formatTime = time => new Date(time).toLocaleTimeString("en-US")
const formatConfidence = confidence =>
	Math.round(confidence * 100 * 100) / 100 + "%"
const formatLat = lat => Math.abs(lat) + (lat < 0 ? "° S" : "° N")
const formatLong = long => Math.abs(long) + (long < 0 ? "° W" : "° E")

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

			if (result[key] < 0.90) return { data, activity }

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
						? [{ time: Date.now(), source: sourceNew }, ...activity]
						: keyPrev === "fire" && key === "nofire"
						? [{ time: Date.now(), source: sourceNew }, ...activity]
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
		},
		{
			id: 2,
			src: "./videos/yosemite.mp4",
			location: "Yosemite, CA",
			lat: 37.8651,
			long: -119.5383,
			key: "nofire",
			confidence: 0
		},
		{
			id: 3,
			src: "./videos/3.mp4",
			location: "Weitchpec, CA",
			lat: 41.1877,
			long: -123.704,
			key: "nofire",
			confidence: 0
		},
		{
			id: 4,
			src: "./videos/4.mp4",
			location: "Ravendale, CA",
			lat: 40.7979,
			long: -120.3659,
			key: "nofire",
			confidence: 0
		},
		{
			id: 5,
			src: "./videos/5.mp4",
			location: "Riverkern, CA",
			lat: 35.7897,
			long: -118.4470,
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
			const videoElements = videosElement.getElementsByClassName(
				"stream-video"
			)

			for (const videoElement of videoElements) {
				videoElement.playbackRate = 0.25
			}

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
			<div className="head">
				<h1>coblaze</h1>
				<p>wildfire tracker</p>
			</div>
			<div className="main-view">
				<MapChart markers={data} />
				<div className="activity-container">
					<h3>ACTIVITY</h3>
					{activity.map(alert => (
						<div
							key={alert.source.id.toString()}
							className="activity-alert"
						>
							<div className="activity-left">
								<svg height={40} width={40} className="activity-icon">
									<Icon
										type={alert.source.key}
										height={40}
										width={40}
									/>
								</svg>
								<p className="activity-time">
									{formatTime(alert.time)}
								</p>
							</div>
							<div className="activity-right">
								<p className="activity-info">
									{alert.source.key === "fire"
										? "Wildfire detected in"
										: "Wildfire extinguished in"}{" "}
									{alert.source.location} with{" "}
									{formatConfidence(alert.source.confidence)}{" "}
									confidence.
								</p>
								<p className="activity-coordinates">
									{formatLat(alert.source.lat)},{" "}
									{formatLong(alert.source.long)}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
			<h3>CAMERA VIEWS</h3>
			<div ref={videosRef} className="stream-container">
				{data.map(source => (
					<div key={source.id.toString()} className="stream">
						<video
							className="stream-video"
							src={source.src}
							muted={true}
							playsInline={true}
							autoPlay={true}
							loop={true}
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
