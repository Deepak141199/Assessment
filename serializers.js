const JSONAPISerializer = require('jsonapi-serializer').Serializer;


const ProductSerializer = new JSONAPISerializer('products', {
    attributes: ['name', 'price'],
  });

  const UserSerializer = new JSONAPISerializer('users', {
    attributes: ['username', 'id'],
  });
  
  module.exports = {UserSerializer, ProductSerializer };
  
