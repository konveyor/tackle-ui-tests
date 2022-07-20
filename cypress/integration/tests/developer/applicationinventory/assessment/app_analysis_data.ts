import { AppDataForAnalysis } from "../../../types/types";

//Custom data for creating an application by populating the source code fields
export const sourceFields: AppDataForAnalysis = {
    repoType: "git",
    sourceRepo: "https://github.com/ibraginsky/book-server",
};

//Custom data for creating an application by populating the binary fields
export const binaryFields: AppDataForAnalysis = {
    group: " io.konveyor.demo",
    artifact: "customers-tomcat",
    version: "0.0.1-SNAPSHOT",
    packaging: "war",
};

//Sample custom data for creating an application for binary mode analysis
export const binaryMode: AppDataForAnalysis = {
    analysis: true,
    group: " io.konveyor.demo",
    artifact: "customers-tomcat",
    version: "0.0.1-SNAPSHOT",
    packaging: "war",
};

//Sample custom data for creating an application for source mode analysis
export const sourceMode: AppDataForAnalysis = {
    analysis: true,
    repoType: "git",
    sourceRepo: "https://github.com/ibraginsky/book-server",
};
