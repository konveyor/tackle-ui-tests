export const excludedList = "#excluded";
export enum ProxyType {
    http = "http",
    https = "https",
}

export const ProxyViewSelectorsByType = {
    [ProxyType.http]: {
        host: '[name="httpHost"]',
        port: '[name="httpPort"]',
        enabledSwitch: "#httpProxy",
        identityRequired: "#http-identity-required",
        credentialsSelectToggle: "#http-proxy-credentials-select-toggle",
        hostHelper: "#httpHost-helper",
    },
    [ProxyType.https]: {
        host: '[name="httpsHost"]',
        port: '[name="httpsPort"]',
        enabledSwitch: "#httpsProxy",
        identityRequired: "#https-identity-required",
        credentialsSelectToggle: "#https-proxy-credentials-select-toggle",
        hostHelper: "#httpsHost-helper",
    },
};

export const navLink = "a.pf-v5-c-nav__link";
export const port = "#port";
export const helper = 'span[class="pf-v5-c-helper-text__item-text"]';
