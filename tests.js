const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./index'); 

chai.use(chaiHttp);
const expect = chai.expect;

describe('API Routes', () => {
  it('should register a new user', (done) => {
    chai.request(app)
      .post('/register')
      .send({ username: 'abc', password: 'abc' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message').equal('User registered successfully');
        done();
      });
  });

  it('should authenticate a user', (done) => {
    chai.request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').equal('Authentication successful');
        done();
      });
  });

  it('should retrieve products', (done) => {
    chai.request(app)
      .get('/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('should retrieve a specific product by ID', (done) => {
    const productId = '65047ffb7a19761c84154578'; 
    chai.request(app)
      .get(`/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('price');
        done();
      });
  });
  

});
