const Microservice = require('@joinbox/loopback-microservice');
const path = require('path');
const { after, before } = require('mocha');

before('start microservice', async function() {
    const appRootDir = path.resolve(__dirname, './server');
    const boot = { appRootDir };
    this.service = await Microservice.start({ boot });
});

after('stop microservice', async function() {
    if (this.service) return this.service.stop();
});
