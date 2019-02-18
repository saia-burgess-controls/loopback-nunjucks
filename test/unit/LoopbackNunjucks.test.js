const { expect } = require('chai');
const { before, describe, it } = require('mocha');

const LoopbackNunjucks = require('../../src/LoopbackNunjucks.js');
const NunjucksMockEnvironment = require('../support/nunjucks/NunjucksMockEnvironment.js');
const TestingPackage = require('../support/templatingPackages/testing-base/index.js');

describe('The LoopbackNunjucks class', () => {

    before('setup loader', function() {
        this.pkg = new TestingPackage();
    });


    it('can be instantiated with an optional options object', () => {
        const instance = new LoopbackNunjucks();
        expect(instance).to.be.an('object');
    });

    describe('LoopbackNunjucks.addPackage(package)', () => {
        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('allows adding packages', function() {
            const packageName = 'testing-base-package';
            expect(this.component.hasPackage(packageName)).to.equal(false);
            this.component.addPackage(this.pkg);
            expect(this.component.hasPackage(packageName)).to.equal(true);
        });

        it('throws an error if the package is already registered', function() {
            expect(() => this.component.addPackage(this.pkg)).to.throw(/already registered/);
        });
    });

    describe('LoopbackNunjucks.hasPackage(packageName)', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('allows checking if a certain package is already registered', function() {
            const packageName = 'testing-base-package';
            expect(this.component.hasPackage(packageName)).to.equal(false);
            this.component.addPackage(this.pkg);
            expect(this.component.hasPackage(packageName)).to.equal(true);
        });

    });

    describe('LoopbackNunjucks.hasFilter(name)', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('checks if a Nunjucks filter already exists within the component', function() {
            const filterName = 'test-filter';
            expect(this.component.hasFilter(filterName)).to.equal(false);
            this.component.addFilter(filterName, () => {});
            expect(this.component.hasFilter(filterName)).to.equal(true);
        });

        it('checks if a Nunjucks filter exists in a registered package', function() {
            const filterName = 'testingBaseCustomArrayJoin';
            expect(this.component.hasFilter(filterName)).to.equal(false);
            this.component.addPackage(this.pkg);
            expect(this.component.hasFilter(filterName)).to.equal(true);
        });

    });

    describe('LoopbackNunjucks.addFilter(name, filter, filterOptions = {}, options = {})', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('allows adding a package independent Nunjucks filter (asynchronous filters have to be' +
            ' declared using the `isAsync` option)', function() {
            const filterName = 'test-filter';
            expect(this.component.hasFilter(filterName)).to.equal(false);
            this.component.addFilter(filterName, () => {}, { isAsync: true });
            expect(this.component.hasFilter(filterName)).to.equal(true);
        });

        it('adding the same filter twice throws an error', function() {
            const filterName = 'test-filter';
            expect(() => this.component.addFilter(filterName))
                .to.throw(/already registered/);
        });

        it('one can override a filter by passing override as an option (this only works for' +
            ' filters directly added to the component)', function() {
            const filterName = 'test-filter';
            const override = true;
            // this would fail otherwise
            this.component.addFilter(filterName, () => {}, {}, { override });
        });

    });

    describe('LoopbackNunjucks.addFilters(filtersObject)', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('allows adding package independent Nunjucks filters in an object (asynchronous' +
            ' filters have to be  declared using the `isAsync` option)', function() {
            const filters = {
                filterOne: {
                    filter(argument, callback) {},
                    options: {
                        isAsync: true,
                    }
                },
                filterTwo: {
                    filter: (argument1, argument2) => {},
                },
            };
            const filterName = 'filterOne';
            expect(this.component.hasFilter(filterName)).to.equal(false);
            this.component.addFilters(filters);
            expect(this.component.hasFilter(filterName)).to.equal(true);
            expect(this.component.hasFilter('filterTwo')).to.equal(true);
        });

    });

    describe('LoopbackNunjucks.hasExtension(name)', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('checks if a Nunjucks extension already exists within the component', function() {
            const extensionName = 'test-extension';
            expect(this.component.hasExtension(extensionName)).to.equal(false);
            this.component.addExtension(extensionName, {
                parse(parser, nodes, lexer){},
                run(context){},
            });
            expect(this.component.hasExtension(extensionName)).to.equal(true);
        });

        it('checks if a Nunjucks extension exists in a registered package', function() {
            const extensionName = 'testingBaseCustomTag';
            expect(this.component.hasExtension(extensionName)).to.equal(false);
            this.component.addPackage(this.pkg);
            expect(this.component.hasExtension(extensionName)).to.equal(true);
        });

    });

    describe('LoopbackNunjucks.addExtension(name, extension, options = {})', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
        });

        it('allows adding a package independent Nunjucks extension', function() {
            const extensionName = 'test-extension';
            expect(this.component.hasExtension(extensionName)).to.equal(false);
            this.component.addExtension(extensionName, {
                parse(){},
                run(){},
            });
            expect(this.component.hasExtension(extensionName)).to.equal(true);
        });

        it('adding the same extension twice throws an error', function() {
            const extensionName = 'test-extension';
            expect(() => this.component.addExtension(extensionName, {}))
                .to.throw(/already registered/);
        });

        it('one can override an extension by passing override as an option', function() {
            const extensionName = 'test-extension';
            const override = true;
            // this would fail otherwise
            this.component.addExtension(extensionName, {}, { override });
        });

    });

    describe('LoopbackNunjucks.addFilterToEnvironment(environment, filterName, filterConfig,' +
        ' options = {})', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
            this.mockEnvironment = new NunjucksMockEnvironment();
        });

        it('adds a filter to an existing Nunjucks Environment', function() {
            const filterName = 'test-filter';
            const filterConfig = {
                filter() {},
                options: {
                    isAsync: true,
                },
            };
            const options = {
                source: 'testing',
            };
            this.component.addFilterToEnvironment(
                this.mockEnvironment,
                filterName,
                filterConfig,
                options,
            );

            expect(this.mockEnvironment.filters).to.have.property('size').that.equals(1);

            const filter = this.mockEnvironment.getFilter(filterName);
            expect(filter).to.have.property('filter', filterConfig.filter);
            expect(filter).to.have.property('isAsync', filterConfig.options.isAsync);
        });

        it('adding a filter twice to an existing Nunjucks Environment throws an error', function() {
            const filterName = 'test-filter';
            const filterConfig = {
                filter() {},
                options: {
                    isAsync: true,
                },
            };
            const options = {
                source: 'testing',
            };
            expect(() => {
                this.component.addFilterToEnvironment(
                    this.mockEnvironment,
                    filterName,
                    filterConfig,
                    options,
                );
            }).to.throw(new RegExp(`.*${options.source}.* already defined`));

        });
    });

    describe('LoopbackNunjucks.addFiltersToEnvironment(environment, packages', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
            this.mockEnvironment = new NunjucksMockEnvironment();
        });

        it('adds all filters exposed by a package to an existing Nunjucks Environment', function() {
            const package1 = {
                name: 'testPackage1',
                filters: {
                    testFilter1: {
                        filter(){},
                    },
                    testFilter2: {
                        filter(){},
                    },
                },
            };
            const package2 = {
                name: 'testPackage2',
                filters: {
                    testFilter3: {
                        filter(){},
                        options: {
                            isAsync: true,
                        },
                    },
                },
            };
            const packages = [
                package1,
                package2,
            ];
            this.component.addFiltersToEnvironment(
                this.mockEnvironment,
                packages,
            );

            expect(this.mockEnvironment.filters).to.have.property('size').that.equals(3);

            expect(() => {
                this.mockEnvironment.getFilter('testFilter1');
                this.mockEnvironment.getFilter('testFilter2');
                this.mockEnvironment.getFilter('testFilter3');
            }).to.not.throw();
        });

    });

    describe('LoopbackNunjucks.addExtensionToEnvironment(environment, name, environmentConfig,' +
        ' options = {})', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
            this.mockEnvironment = new NunjucksMockEnvironment();
        });

        it('adds an extension to an existing Nunjucks Environment', function() {
            const name = 'test-extension';
            const config = {
                extension: {},
            };
            const options = {
                source: 'testing',
            };
            this.component.addExtensionToEnvironment(
                this.mockEnvironment,
                name,
                config,
                options,
            );

            expect(this.mockEnvironment.extensions).to.have.property('size').that.equals(1);

            const extension = this.mockEnvironment.getExtension(name);
            expect(extension).to.equal(config.extension);
        });

        it('adding an extension twice to an existing Nunjucks Environment throws an error', function() {
            const name = 'test-extension';
            const config = {
                extension: {},
            };
            const options = {
                source: 'testing',
            };
            expect(() => {
                this.component.addExtensionToEnvironment(
                    this.mockEnvironment,
                    name,
                    config,
                    options,
                );
            }).to.throw(new RegExp(`.*${options.source}.* already defined`));

        });
    });

    describe('LoopbackNunjucks.addExtensionsToEnvironment(environment, packages', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
            this.mockEnvironment = new NunjucksMockEnvironment();
        });

        it('adds all extensions exposed by a package to an existing Nunjucks Environment', function() {
            const package1 = {
                name: 'testPackage1',
                extensions: {
                    testExtension1: {
                        extension: {},
                    },
                },
            };
            const package2 = {
                name: 'testPackage2',
                extensions: {
                    testExtension2: {
                        extension: {},
                    },
                    testExtension3: {
                        extension: {},
                    },
                },
            };
            const packages = [
                package1,
                package2,
            ];
            this.component.addExtensionsToEnvironment(
                this.mockEnvironment,
                packages,
            );

            expect(this.mockEnvironment.extensions).to.have.property('size').that.equals(3);

            expect(this.mockEnvironment.hasExtension('testExtension1')).to.be.equal(true);
            expect(this.mockEnvironment.hasExtension('testExtension2')).to.be.equal(true);
            expect(this.mockEnvironment.hasExtension('testExtension3')).to.be.equal(true);
        });

    });

    describe('LoopbackNunjucks.install(app)', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
            this.mockApp = new Map();
        });

        it('uses the nunjucks internal mechanism to hook it into express', async function() {
            await this.component.install(this.mockApp);
            expect(this.mockApp.has('nunjucksEnv'));
            expect(this.mockApp.has('view'));
        });

    });

    describe('LoopbackNunjucks.ensureDependencies(environment, packages)', () => {

        before('setup instance', function() {
            this.component = new LoopbackNunjucks();
            this.mockEnvironment = new NunjucksMockEnvironment();
        });

        it('does not throw errors for an empty environment', function() {
            expect(() => {
                this.component.ensureDependencies(this.mockEnvironment, []);
            }).to.not.throw();
        });

        it('throws an error if a required filter is missing', function() {
            const name = 'testing-package';
            const dependencyName = 'missingFilter';
            const packages = [
                {
                    name,
                    dependencies: {
                        filters: [ dependencyName ],
                    },
                },
            ];
            expect(() => {
                this.component.ensureDependencies(this.mockEnvironment, packages);
            }).to.throw(new RegExp(`.*${dependencyName}.*.${name}`));
        });

        it('throws an error if a required extension is missing', function() {
            const name = 'testing-package';
            const dependencyName = 'missingExtension';
            const packages = [
                {
                    name,
                    dependencies: {
                        extensions: [ dependencyName ],
                    },
                },
            ];
            expect(() => {
                this.component.ensureDependencies(this.mockEnvironment, packages);
            }).to.throw(new RegExp(`.*${dependencyName}.*.${name}`));
        });

        it('throws an error if a required package is missing', function() {
            const name = 'testing-package';
            const dependencyName = 'missing-package';
            const packages = [
                {
                    name,
                    dependencies: {
                        packages: [ dependencyName ],
                    },
                },
            ];
            expect(() => {
                this.component.ensureDependencies(this.mockEnvironment, packages);
            }).to.throw(new RegExp(`.*${dependencyName}.*.${name}`));
        });

        it('does work if all the dependencies are met whereas order does not matter', function() {
            const package1 = {
                name: 'testingPackage1',
                extensions: {
                    extension1: {},
                },
                dependencies: {
                    filters: ['filter2'],
                },
            };
            const package2 = {
                name: 'testingPackage2',
                filters: {
                    filter2: {
                        filter(){},
                    },
                },
                dependencies: {
                    packages: ['testingPackage1'],
                    extensions: ['extension1'],
                },
            };

            const packages = [
                package1,
                package2,
            ];

            this.component.addPackage(package1);
            this.component.addPackage(package2);

            this.component.addExtensionsToEnvironment(this.mockEnvironment, packages);
            this.component.addFiltersToEnvironment(this.mockEnvironment, packages);
            // @todo: properly separate concerns between environment based dependencies
            //        (filters, extensions) and component based dependencies
            expect(() => {
                this.component.ensureDependencies(this.mockEnvironment, packages);
            }).to.not.throw();
        });

    });
});
