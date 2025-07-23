import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

export default (on: Cypress.PluginEvents) => {
    on(
        "file:preprocessor",
        createBundler({
            plugins: [
                NodeModulesPolyfillPlugin(),
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true,
                }),
            ],
        })
    );
};
