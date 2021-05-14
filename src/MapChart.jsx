import React from "react"
import {
	ComposableMap,
	Geographies,
	Geography,
	Marker
} from "react-simple-maps"

const geoUrl = "./maps/california.json"

const MapChart = ({ markers }) => {
	return (
		<ComposableMap
			projection="geoAlbersUsa"
			projectionConfig={
				{
					// scale: 400
				}
			}
		>
			<Geographies geography={geoUrl}>
				{({ geographies }) =>
					geographies.map(geo => (
						<Geography
							key={geo.rsmKey}
							geography={geo}
							fill="#EAEAEC"
							stroke="#D6D6DA"
						/>
					))
				}
			</Geographies>
			{markers.map(({ location, lat, long }) => (
				<Marker key={location} coordinates={[long, lat]}>
					<circle r={3} fill="#F00" stroke="#fff" strokeWidth={2} />
					<text
						textAnchor="middle"
						y={10}
						style={{ fontSize: "5px", fontFamily: "system-ui", fill: "#5D5A6D" }}
					>
						{location}
					</text>
				</Marker>
			))}
		</ComposableMap>
	)
}

export default MapChart
