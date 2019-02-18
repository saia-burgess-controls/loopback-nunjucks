const console = require('console');
const nunjucks = require('nunjucks');
const { TemplateLoaderPackage } = require('./loaders/index.js');

module.exports = class LoopbackNunjucks {

    constructor(options = {}, { logger = console } = {}) {
        this.packages = new Map();
        this.filters = new Map();
        this.extensions = new Map();
        this.logger = logger;
        this.options = options;
    }

    /**
     * Adds a templating package to the component.
     *
     * The template is referenced by its name property.
     *
     * @param {Object} pkg - the templating package
     * @param {String} pkg.name - the identifier to map the package to
     */
    addPackage(pkg) {
        const { name } = pkg;

        if (this.packages.has(name)) {
            throw new Error(`Package "${name}" is already registered.`);
        }

        this.packages.set(pkg.name, pkg);
    }

    /**
     * Check if a package with a certain name is already registered.
     *
     * @param {string} name - the name of the package
     * @return {boolean}
     */
    hasPackage(name) {
        return this.packages.has(name);
    }

    /**
     * Adds all filters given in the passed object.
     *
     * The object should be of the form:
     * {
     *     filterName: {
     *         filter: filterFunction,
     *         options: {
     *             isAsync: true
     *         }
     *     }
     * }
     *
     * @param {object} filters
     */
    addFilters(filters = {}) {
        Object
            .entries(filters)
            .forEach(([filterName, filterConfig]) => {
                const {
                    filter,
                    options,
                } = filterConfig;
                this.addFilter(filterName, filter, options);
        });
    }

    /**
     * Adds all extensions given in the passed object.
     *
     * The object should be of the form:
     * {
     *     extensionName: {
     *         extension: nunjucksExtension,
     *         options: {}
     *     }
     * }
     *
     * @param {object} filters
     */
    addExtensions(extensions = {}) {
        Object
            .entries(extensions)
            .forEach(([extensionName, extensionConfig]) => {
                const {
                    extension,
                    options,
                } = extensionConfig;
                this.addExtension(extensionName, extension, options);
            });
    }

    /**
     * Checks if the component has a filter with the given name (within the component
     * as well as within the packages).
     *
     * @param {string} name
     * @return {boolean}
     */
    hasFilter(name) {
        return this.filters.has(name)
            || Array.from(this.packages.values())
                .some(({ filters = {}}) => {
                    return Object.prototype.hasOwnProperty.call(filters, name);
                });
    }

    hasExtension(name) {
        return this.extensions.has(name)
            || Array.from(this.packages.values())
                .some(({ extensions = {}}) => {
                    return Object.prototype.hasOwnProperty.call(extensions, name);
                });
    }

    /**
     * Adds a nunjucks filter to the component.
     *
     * @param {string} name
     * @param {function} filter - the loopback filter function
     * @param {object} [options] - the options for nunjucks
     * @param {object} [componentOptions] - options for the components filter handling
     *
     * @throws Error
     */
    addFilter(name, filter, options = {}, { override = false } = {}) {
        if (this.hasFilter(name) && override !== true) {
            throw new Error(`Filter "${name}" is already registered`);
        }

        this.filters.set(name, {
            filter,
            options,
        });
    }

    /**
     * Adds a nunjucks extension to the component.
     *
     * @param {string} name
     * @param {function} filter - the loopback filter function
     * @param {object} [options] - options for the components extension handling
     *
     * @throws Error
     */
    addExtension(name, extension, options = {}) {
        const { override } = options;
        if (this.hasExtension(name) && override !== true) {
            throw new Error(`Extension "${name}" is already registered`);
        }
        this.extensions.set(name, {
            extension,
            options,
        });
    }

    /**
     * Creates a fully configured Nunjucks environment.
     *
     * This method creates a template loader for each package and registers all
     * registered filters and extensions.
     *
     * @return {nunjucks.Environment}
     */
    createEnvironment() {
        const excludedPackages = this.options.excludePackages || [];
        const filteredPackages = Array.from(this.packages.values())
            .filter(({ name }) => !excludedPackages.includes(name));
        const loaders = filteredPackages.map((pkg) => new TemplateLoaderPackage(pkg));
        const environment = new nunjucks.Environment(loaders, this.options.nunjucks);

        this.filters.forEach((config, name) => {
            const source = 'LoopbackNunjucks';
            this.addFilterToEnvironment(environment, name, config, { source });
        });

        this.extensions.forEach((config, name) => {
            const source = 'LoopbackNunjucks';
            this.addExtensionToEnvironment(environment, name, config, { source });
        });

        this.addFiltersToEnvironment(environment, filteredPackages);
        this.addExtensionsToEnvironment(environment, filteredPackages);
        this.ensureDependencies(environment, filteredPackages);

        return environment;
    }

    /**
     * Adds all filters contained within a collection of packages to the environment.
     *
     * @param {nunjucks.Environment} environment
     * @param {Array} packages
     */
    addFiltersToEnvironment(environment, packages) {
        packages.forEach(({ name, filters = {} }) => {
            Object.entries(filters).forEach(([name, config]) => {
                const source = `package ${name}`;
                this.addFilterToEnvironment(environment, name, config, { source });
            });
        });
    }
    /**
     * Adds a single filter to the passed environment.
     *
     * @param {nunjucks.Environment} environment
     * @param {string} filterName
     * @param {object} config
     * @param {function} config.filter - the nunjucks filter function
     * @param {object} [config.options] - filter options (currently only containing isAsync
     * @param {object} [options] - options respected by the component (for future usage)
     * @param {string} [options.source] - source of the extension (for error messages)
     *
     * @return void
     */
    addFilterToEnvironment(environment, filterName, { filter, options = {}}, { source = '' } = {}) {
        let err = null;
        try {
            // there is no hasFilter method
            environment.getFilter(filterName);
        } catch (error) {
            err = error;
        }
        if (!err) {
            const msg = `The filter "${filterName}" exposed by "${source}" is already defined`;
            throw new Error(msg);
        }
        environment.addFilter(filterName, filter, options.isAsync);
    }

    /**
     * Adds all extensions contained in the collection of packages to the passed environment
     *
     *
     * @param {nunjucks.Environment} environment
     * @param {array} packages
     */
    addExtensionsToEnvironment(environment, packages) {
        packages.forEach(({ name, extensions = {} }) => {
            Object.entries(extensions).forEach(([name, config]) => {
                const source = `package ${name}`;
                this.addExtensionToEnvironment(environment, name, config, { source });
            });
        });
    }

    /**
     * Adds a single extension to the passed environment.
     *
     *
     * @param {nunjucks.Environment} environment
     * @param {string} extensionName
     * @param {object} config
     * @param {object} config.extension - the Nunjucks extension
     * @param {object} [config.options] - options for future usage
     * @param {object} [options] - options for the component
     * @param {string} [options.source] - source of the extension (for error messages)
     *
     * @return void
     */
    addExtensionToEnvironment(environment, extensionName, { extension, options = {}}, { source = '' }) {
        if (environment.hasExtension(extensionName)) {
            const msg = `The extension "${extensionName}" exposed by "${source}" is already defined`;
            throw new Error(msg);
        }
        environment.addExtension(extensionName, extension);
    }

    /**
     * Compares the dependencies of the registered packages to the extensions and filters
     * registered at the environment and the packages of the component.
     *
     * @param {nunjucks.Environment} environment
     * @param {array} registeredPackages
     */
    ensureDependencies(environment, registeredPackages = []) {
        registeredPackages.forEach(({ name, dependencies = {}}) => {
            const {
                filters = [],
                extensions = [],
                packages = [],
            } = dependencies;
            filters.forEach((filterName) => {
                try {
                    environment.getFilter(filterName);
                } catch (error) {
                    const msg = `The filter "${filterName}" required by package "${name}" is not registered (${error.message})`;
                    throw new Error(msg);
                }
            });
            extensions.forEach((extensionName) => {
                if (!environment.hasExtension(extensionName)) {
                    const msg = `The extension "${extensionName}" required by package "${name}" is not registered`;
                    throw new Error(msg);
                }
            });
            packages.forEach((packageName) => {
                if (!this.hasPackage(packageName)) {
                    const msg = `The package "${packageName}" required by package "${name}" is not registered`;
                    throw new Error(msg);
                }
            });
        });
    }

    /**
     * Creates a nunjucks environment and hooks it into the application.
     *
     * @note: the method is async to preserve the flexibility
     *
     * @param app - the loopback application
     * @return {Promise<nunjucks.Environment>}
     */
    async install(app) {
        const nunjucksEnvironment = this.createEnvironment();
        nunjucksEnvironment.express(app);

        return nunjucksEnvironment;
    }

};
