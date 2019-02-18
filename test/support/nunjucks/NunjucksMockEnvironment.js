module.exports = class NunjucksMockEnvironment {
    constructor(loaders = []) {
        this.loaders = [];
        this.filters = new Map();
        this.extensions = new Map();
    }

};