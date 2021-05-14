import React from "react"

const Icon = ({ type, ...props }) =>
	type === "fire" ? (
		<image {...props} href="./images/fire.svg" />
	) : (
		<image {...props} href="./images/tree.svg" />
	)

export default Icon
