module.exports = class NunjucksMockEnvironment {
    constructor(loaders = [], options = {}) {
        this.loaders = loaders;
        this.options = options;
        this.filters = new Map();
        this.extensions = new Map();
    }

    getFilter(name) {
        if (!this.filters.has(name)) {
            throw new Error('Filter does not exist');
        }
        return this.filters.get(name);
    }

    addFilter(name, filter, isAsync = false) {
        this.filters.set(name, {filter, isAsync});
    }

    hasExtension(name) {
        return this.extensions.has(name);
    }

    addExtension(name, extension) {
        this.extensions.set(name, extension);
    }

    getExtension(name) {
        return this.extensions.get(name);
    }

};
