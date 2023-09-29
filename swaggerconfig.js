const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'API Documentation', 
      version: '1.0.0', 
      description: 'API documentation for your Node.js application',
    },
  },
  // files containing your JSDoc comments
  apis: ['./index.js', './routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
