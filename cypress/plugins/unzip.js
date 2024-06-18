const decompress = require("decompress");

const unzip = ({ path, file }) => {
    decompress(path + file, path + "/" + file.split(".")[0]);
    return null;
};

module.exports = {
    unzip,
};
