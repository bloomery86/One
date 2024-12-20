document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Elements
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.querySelector('.subtotal');
    const shippingElement = document.querySelector('.shipping');
    const totalElement = document.querySelector('.total-amount');
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Render cart items
    function renderCartItems() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">${item.price} lei × ${item.quantity}</p>
                </div>
                <div class="item-total">${item.price * item.quantity} lei</div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Update summary
        updateOrderSummary(subtotal);
    }

    // Update order summary
    function updateOrderSummary(subtotal) {
        const shipping = document.querySelector('input[name="delivery"]:checked').value === 'courier' ? 15 : 0;
        const total = subtotal + shipping;

        subtotalElement.textContent = `${subtotal} lei`;
        shippingElement.textContent = shipping === 0 ? 'Gratuit' : `${shipping} lei`;
        totalElement.textContent = `${total} lei`;
    }

    // Handle delivery option change
    deliveryOptions.forEach(option => {
        option.addEventListener('change', () => {
            const subtotal = parseFloat(subtotalElement.textContent);
            updateOrderSummary(subtotal);
        });
    });

    // Form validation
    function validateForm() {
        const requiredFields = checkoutForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        return isValid;
    }

    // Handle form submission
    if (checkoutForm) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (validateForm()) {
                // Save delivery data
                const deliveryData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    county: document.getElementById('county').value,
                    address: document.getElementById('address').value,
                    deliveryMethod: document.querySelector('input[name="delivery"]:checked').value
                };
                
                localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
                
                // Redirect to payment page
                window.location.href = './payment.html';
            } else {
                alert('Vă rugăm să completați toate câmpurile obligatorii.');
            }
        });
    }

    // Initialize the page
    renderCartItems();
});
