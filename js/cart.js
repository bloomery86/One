class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartCountElements = document.querySelectorAll('.cart-count');
        this.modal = document.getElementById('cartModal');
        this.cartItemsContainer = document.querySelector('.cart-items-container');
        this.cartTotal = document.querySelector('.total-amount');
        // Use the full products list from products.js
        this.products = window.products || {};
        this.setupEventListeners();
        this.updateCartDisplay();
        this.setupGlobalCartControls();
    }

    setupEventListeners() {
        // Add to cart buttons from index page
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAddToCart(e));
        });

        // Cart icon click
        document.querySelectorAll('.cart-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        });

        // Close cart
        const closeCart = document.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }

        // Close cart when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeCart();
            }
        });

        // Empty cart button
        const emptyCartBtn = document.querySelector('.empty-cart-btn');
        if (emptyCartBtn) {
            emptyCartBtn.addEventListener('click', () => this.emptyCart());
        }

        // Handle checkout button click
        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                // Check if cart is empty
                if (!this.items || this.items.length === 0) {
                    alert('Coșul tău este gol. Adaugă produse pentru a continua.');
                    return;
                }
                
                // Create default delivery data if not set
                if (!localStorage.getItem('deliveryData')) {
                    const defaultDeliveryData = {
                        deliveryMethod: 'courier'
                    };
                    localStorage.setItem('deliveryData', JSON.stringify(defaultDeliveryData));
                }
                window.location.href = './payment.html';
            });
        }
    }

    setupGlobalCartControls() {
        // Handle quantity controls in cart modal
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if clicked element is a quantity button in cart
            if (target.closest('.quantity-controls')) {
                const qtyBtn = target.closest('.qty-btn');
                if (qtyBtn) {
                    e.preventDefault();
                    const productId = qtyBtn.getAttribute('data-product-id');
                    const currentQty = parseInt(qtyBtn.parentElement.querySelector('.quantity').textContent);
                    const newQty = qtyBtn.classList.contains('minus') ? currentQty - 1 : currentQty + 1;
                    
                    if (productId) {
                        this.updateItemQuantity(productId, newQty);
                    }
                }
            }

            // Check if clicked element is remove button in cart
            if (target.closest('.remove-item')) {
                e.preventDefault();
                const removeBtn = target.closest('.remove-item');
                const productId = removeBtn.getAttribute('data-product-id');
                if (productId) {
                    this.removeFromCart(productId);
                }
            }
        });
    }

    handleAddToCart(e) {
        const btn = e.currentTarget;
        const productId = btn.dataset.id;
        
        // For product detail page, use the data directly from the button
        if (btn.classList.contains('add-to-cart-btn')) {
            const productData = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image,
                quantity: parseInt(document.querySelector('.qty-input')?.value || 1),
                cover: btn.dataset.cover || 'standard'
            };
            this.addToCart(productData);
        } else {
            // For products page, use the products list
            const product = this.products[productId];
            if (!product) {
                console.error('Product not found:', productId);
                return;
            }

            const productData = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images ? product.images[0] : product.image,
                quantity: 1,
                cover: 'standard'
            };
            this.addToCart(productData);
        }
        
        gsap.to(btn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.showNotification('Produsul a fost adăugat în coș');
            }
        });
    }

    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            this.items.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        // Update cart count
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        this.cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });

        // Update cart items
        if (this.cartItemsContainer) {
            this.cartItemsContainer.innerHTML = '';
            
            if (this.items.length === 0) {
                this.cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Coșul tău este gol</p>
                        <button class="continue-shopping" onclick="cart.closeCart()">
                            Continuă cumpărăturile
                        </button>
                    </div>`;
                if (this.cartTotal) {
                    this.cartTotal.textContent = '0.00 RON';
                }
                return;
            }

            this.items.forEach(item => {
                const itemElement = this.createCartItemElement(item);
                this.cartItemsContainer.appendChild(itemElement);
            });

            // Update total
            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (this.cartTotal) {
                this.cartTotal.textContent = `${total.toFixed(2)} RON`;
            }
        }
    }

    createCartItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <button class="remove-item" data-product-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="item-options">
                    <span>Ambalaj: ${item.cover || 'standard'}</span>
                </p>
                <div class="item-price">${(item.price * item.quantity).toFixed(2)} RON</div>
                <div class="quantity-controls">
                    <button class="qty-btn minus" data-product-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn plus" data-product-id="${item.id}">+</button>
                </div>
            </div>
        `;
        return itemDiv;
    }

    updateItemQuantity(id, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(id);
            return;
        }

        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartDisplay();
            
            // Show feedback
            this.showNotification('Cantitate actualizată');
        }
    }

    removeFromCart(id) {
        this.items = this.items.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
        
        // Show feedback
        this.showNotification('Produs eliminat din coș');
    }

    emptyCart() {
        this.items = [];
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
    }

    openCart() {
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    handleCheckout() {
        // Implement checkout logic here
        console.log('Proceeding to checkout with items:', this.items);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        gsap.to(notification, {
            opacity: 1,
            y: 20,
            duration: 0.3
        });

        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                y: 0,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 2000);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
});
