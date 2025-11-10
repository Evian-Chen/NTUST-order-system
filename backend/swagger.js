const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'NTUST Order System API',
    description: 'API documentation for NTUST Order System',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Orders',
      description: 'Order management endpoints'
    },
    {
      name: 'Items',
      description: 'Item management endpoints'
    },
    {
      name: 'General',
      description: 'General API endpoints'
    }
  ],
  definitions: {
    Order: {
      _id: "507f1f77bcf86cd799439011",
      items: [
        {
          item: "507f1f77bcf86cd799439012",
          quantity: 2
        }
      ],
      totalAmount: 100,
      status: "pending",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z"
    },
    Item: {
      _id: "507f1f77bcf86cd799439012",
      name: "Coffee",
      price: 50,
      description: "Fresh brewed coffee",
      category: "beverages",
      available: true,
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z"
    },
    CreateOrderRequest: {
      items: [
        {
          item: "507f1f77bcf86cd799439012",
          quantity: 2
        }
      ]
    },
    CreateItemRequest: {
      name: "Coffee",
      price: 50,
      description: "Fresh brewed coffee",
      category: "beverages",
      available: true
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
