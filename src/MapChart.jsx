import React from "react"
import {
	ComposableMap,
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
			{markers.map(({ key, location, lat, long }) => (
				<Marker key={location} coordinates={[long, lat]}>
					<Icon type={key} x={-5} y={-5} width={10} height={10} />
					<text
						textAnchor="middle"
						y={10}
						style={{
							fontSize: "5px",
							fontFamily: "system-ui",
							fill: "#5D5A6D"
						}}
					>
						{location}
					</text>
				</Marker>
			))}
		</ComposableMap>
	)
}

export default MapChart
