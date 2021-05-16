import React from "react"
import {
	ComposableMap,
	ZoomableGroup,
	Geographies,
	Geography,
	Marker
} from "react-simple-maps"
import Icon from "./Icon"

const geoUrl = "./maps/california.json"

const MapChart = ({ markers }) => {
	return (
		<ComposableMap
			projection="geoAlbersUsa"
			projectionConfig={{
				scale: 3000
			}}
			width={500}
			height={700}
		>
			<ZoomableGroup center={[-119.44944, 37.16611]}>
				<Geographies geography={geoUrl}>
					{({ geographies }) =>
						geographies.map(geo => (
							<Geography
								key={geo.rsmKey}
								geography={geo}
								fill="#004d1f"
								stroke="none"
								style={{
									default: {
										outline: "none"
									},
									hover: {
										outline: "none"
									},
									pressed: {
										outline: "none"
									}
								}}
							/>
						))
					}
				</Geographies>
				{markers.map(({ key, location, lat, long }) => (
					<Marker key={location} coordinates={[long, lat]}>
						<Icon type={key} x={-10} y={-35} width={30} height={30} />
						<text
							textAnchor="middle"
							y={10}
							style={{
								fontSize: "16px",
								fontFamily: "system-ui",
								fill: "#478560"
							}}
						>
							{location}
						</text>
					</Marker>
				))}
			</ZoomableGroup>
		</ComposableMap>
	)
}

export default MapChart
