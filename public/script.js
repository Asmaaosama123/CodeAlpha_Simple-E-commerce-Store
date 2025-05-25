document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    function toggleCart() {
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    fetchProducts();
    fetchCart();

    function fetchProducts() {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(products => {
                renderProducts(products);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    function renderProducts(products) {
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `;
            productList.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }

    function addToCart(productId) {
        fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                fetchCart();
                if (!cartSidebar.classList.contains('active')) {
                    toggleCart();
                }
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
        });
    }

    function removeFromCart(productId) {
        fetch(`/api/cart/${productId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                fetchCart();
            }
        })
        .catch(error => {
            console.error('Error removing from cart:', error);
        });
    }

    function fetchCart() {
        fetch('/api/cart')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(cart => {
                renderCart(cart);
            })
            .catch(error => {
                console.error('Error fetching cart:', error);
            });
    }

    function renderCart(cart) {
        cartItems.innerHTML = '';
        let total = 0;
        let itemCount = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.product.image}" alt="${item.product.name}" class="cart-image">
                    </div>
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.product.name}</span>
                        <span class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.product.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.product.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.product.id}">×</button>
                `;
                cartItems.appendChild(cartItem);
                total += item.product.price * item.quantity;
                itemCount += item.quantity;
            });
        }
    
        cartCount.textContent = itemCount;
        cartTotal.textContent = total.toFixed(2);
        
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }

    function handleQuantityChange(e) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        const isPlus = e.target.classList.contains('plus');
        const quantitySpan = e.target.parentElement.querySelector('.quantity');
        let newQuantity = parseInt(quantitySpan.textContent);

        if (isPlus) {
            newQuantity++;
        } else {
            newQuantity = Math.max(1, newQuantity - 1);
        }

        fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: newQuantity })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                fetchCart();
            }
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
        });
    }

    function checkout() {
        if (parseInt(cartCount.textContent) === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        alert('Thank you for your purchase!');
        fetch('/api/cart', {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(() => {
            fetchCart();
            toggleCart();
        })
        .catch(error => {
            console.error('Error during checkout:', error);
        });
    }
});