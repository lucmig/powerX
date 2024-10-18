const assert = require('node:assert')
const { before, after, afterEach, describe, it } = require('node:test');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./index').default;
const api = require('./api').default;

chai.use(chaiHttp);

describe('feed service', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
    })

    after(async () => {
        server.close();
    })

    it('Should call add data on post', async () => {
        const addReadingsFake = sinon.fake.resolves()
        sandbox.replace(api, 'addReadings', addReadingsFake)
        const addBadReadingsFake = sinon.fake.resolves()
        sandbox.replace(api, 'addBadReadings', addBadReadingsFake)

        const response = await chai.request(server)
            .post('/data')
            .set('content-type', 'text/plain')
            .send(`1649941817 Voltage 1.34
1649941818 Voltage 1.35
1649941817 Current 12.0
1649941818 Current 14.0`)

        assert.ok(addReadingsFake.called)
        assert.ok(!addBadReadingsFake.called)
        assert.equal(response.status, 200);
    });

    it('Should validate data', async () => {
        const addReadingsFake = sinon.fake.resolves()
        sandbox.replace(api, 'addReadings', addReadingsFake)
        const addBadReadingsFake = sinon.fake.resolves()
        sandbox.replace(api, 'addBadReadings', addBadReadingsFake)
        const response = await chai.request(server)
            .post('/data')
            .set('content-type', 'text/plain')
            .send(`1649941817 Voltage 1.34
1649941818 1.35 Voltage`)

        assert.ok(addReadingsFake.called)
        assert.ok(addBadReadingsFake.called)
        assert.equal(response.status, 200);
    });


    it('Should respond with the correct data for GET /data', async () => {
        const getReadingsFake = sinon.fake.resolves([{
            timestamp: 1649941817,
            name: 'Test',
            value: 12.34
        }])
        sandbox.replace(api, 'getReadings', getReadingsFake)

        const response = await chai.request(server)
            .get('/data')
            .query({
                from: '2022-04-14',
                to: '2022-04-15'
            })
        assert.ok(getReadingsFake.called)
        assert.equal(response.status, 200);
    });
});