import { inputText } from "../../utils/utils";

export enum ProxyViewSelectors {
    httpHost = '[name="httpHost"]',
    httpPort = '[name="httpPort"]',
    httpSwitch = "#httpProxy",
    httpsHost = '[name="httpsHost"]',
    httpsPort = '[name="httpsPort"]',
    httpsSwitch = "#httpsProxy",
    portHelper = "#port-helper",
}

export enum ProxyType {
    http = "http",
    https = "https",
}

export function fillHost(type: ProxyType, host: string) {
    inputText(
        type === ProxyType.http ? ProxyViewSelectors.httpHost : ProxyViewSelectors.httpsHost,
        host
    );
}

export function fillPort(type: ProxyType, port: string) {
    inputText(
        type === ProxyType.http ? ProxyViewSelectors.httpPort : ProxyViewSelectors.httpsPort,
        port
    );
}
