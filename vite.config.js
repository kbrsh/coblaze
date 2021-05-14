import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import eslint from "@rollup/plugin-eslint";

export default defineConfig({
	plugins: [
		{
			...eslint({ include: ["./src/**/*.js"] }),
			enforce: "pre"
		},
		reactRefresh()
	]
});
