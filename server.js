const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let products = [
    { 
        id: 1, 
        name: 'Wireless Headphones', 
        price: 19.99, 
        description: 'High-quality wireless headphones with noise cancellation',
        image: '/images/premium_photo-1679913792906-13ccc5c84d44.jpeg' 
    },
    { 
        id: 2, 
        name: 'Running Sneakers', 
        price: 29.99, 
        description: 'Comfortable running shoes with breathable mesh',
        image: '/images/Product+Showcase-1.jpg' 
    },
    { 
        id: 3, 
        name: 'Cotton T-shirt', 
        price: 39.99, 
        description: 'Premium quality cotton t-shirt available in multiple colors',
        image: '/images/C83639s.webp' 
    },
    { 
        id: 4, 
        name: 'Smart Watch', 
        price: 99.99, 
        description: 'Fitness tracker with heart rate monitor and GPS',
        image: '/images/smartwatch.jpg' 
    },
    { 
        id: 5, 
        name: 'Bluetooth Speaker', 
        price: 49.99, 
        description: 'Portable waterproof speaker with 12-hour battery life',
        image: '/images/speaker.jpg' 
    },
    { 
        id: 6, 
        name: 'Backpack', 
        price: 34.99, 
        description: 'Durable laptop backpack with USB charging port',
        image: '/images/backpack.jpg' 
    },
    { 
        id: 7, 
        name: 'Wireless Mouse', 
        price: 24.99, 
        description: 'Ergonomic wireless mouse with silent click technology',
        image: '/images/mouse.jpg' 
    },
    
];
let cart = [];

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/cart', (req, res) => {
    const productId = parseInt(req.body.productId);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }

    res.json({ success: true, cart });
});

app.put('/api/cart/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    const newQuantity = parseInt(req.body.quantity);
    
    const cartItem = cart.find(item => item.product.id === productId);
    
    if (!cartItem) {
        return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (newQuantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    cartItem.quantity = newQuantity;
    res.json({ success: true, cart });
});

app.delete('/api/cart/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    cart = cart.filter(item => item.product.id !== productId);
    res.json({ success: true, cart });
});

app.delete('/api/cart', (req, res) => {
    cart = [];
    res.json({ success: true, cart });
});

app.get('/api/cart', (req, res) => {
    res.json(cart);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});