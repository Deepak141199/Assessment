const JSONAPISerializer = require('jsonapi-serializer').Serializer;

// Modify your ProductSerializer to include the custom serialization logic

const ProductSerializer = new JSONAPISerializer('products', {
    attributes: ['name', 'price'],
  });

  const UserSerializer = new JSONAPISerializer('users', {
    attributes: ['username', 'id'],
  });
  
  module.exports = {UserSerializer, ProductSerializer };
  
