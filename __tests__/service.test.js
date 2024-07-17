const supertest = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const { default: mongoose } = require('mongoose');

const userId = new mongoose.Types.ObjectId().toString();

const servicePayload = {
  user: userId,
  businessName: 'The diamond hall',
  about: 'an Hall for wedding party',
  location: 'ismailia',
  businessCategory: 'DJs',
  phoneNumber: '01064704702',
  startFrom: '15000',
};
const userPayload = {
  _id: '6670dfb8a0f826b9b6695f5f',
  name: 'ali.noor.spam@gmail.com',
  email: 'ali.noor.sp.a.m@gmail.com',
  password: '********',
};

describe('service', () => {
  describe('get service route', () => {
    describe('given the service does not exist', () => {
      it('should return a 404', async () => {
        const serviceId = '5f92cbf10cf217478ba93561';
        await supertest(app).get(`/api/v1/services/${serviceId}`).expect(404);
      });
    });

    describe('given the service does exist', () => {
      it('should return a 200 status and the service', async () => {
        const serviceId = '661d36325a1a16f385c72f40';
        await supertest(app).get(`/api/v1/services/${serviceId}`).expect(200);
      });
    });
  });

  describe('create service route', () => {
    describe('given the user is not logged in', () => {
      it('should return a 403', async () => {
        const { statusCode } = await supertest(app).post(`/api/v1/services`);
        expect(statusCode).toBe(403);
      });
    });
  });

  describe('create service route', () => {
    describe('given the user is logged in', () => {
      it('should return a 200 and create the product', async () => {
        console.log(process.env.JWT_SECRET);
        const token = jwt.sign(userPayload._id, process.env.JWT_SECRET);
        console.log(token);

        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/services`)
          .set('Authorization', `Bearer ${token}`)
          .send(servicePayload);
        expect(statusCode).toBe(200);
      });
    });
  });
});
