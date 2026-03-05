// Lógica del carrito: carga productos en el select y maneja el submit del form.
const form = document.getElementById('addToCartForm');
const select = document.getElementById('productSelect');
const cartId = form?.dataset.cartId;

// Cargar todos los productos (sin paginación) desde la API
let productList = [];
fetch('/api/products/all')
    .then(r => r.json())
    .then(data => {
        productList = data.payload || data;
        productList.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p._id;
            opt.textContent = `${p.title} - $${p.price}`;
            select.appendChild(opt);
        });
        // También llenar los selects del formulario de actualización
        fillUpdateSelects();
    });

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pid = select.value;
    if (!pid) return Swal.fire({ icon: 'warning', title: 'Atención', text: 'Seleccioná un producto antes de agregar.' });
    form.action = `/api/carts/${cartId}/product/${pid}`;
    form.submit();
});

// Función para eliminar un producto del carrito
function removeFromCart(cartId, productId) {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: 'Se eliminará este producto del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'DELETE' })
                .then(r => {
                    if (r.ok) {
                        window.location.reload();
                    } else {
                        throw new Error('Error al eliminar');
                    }
                })
                .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el producto' }));
        }
    });
}

// Función para vaciar todos los productos del carrito
function clearCart(cartId) {
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/carts/${cartId}`, { method: 'DELETE' })
                .then(r => {
                    if (r.ok) {
                        window.location.reload();
                    } else {
                        throw new Error('Error al vaciar');
                    }
                })
                .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo vaciar el carrito' }));
        }
    });
}

// Actualizar cantidad de un producto específico en el carrito
function updateQuantity(cartId, productId) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(input.value);

    if (!quantity || quantity < 1) {
        return Swal.fire({ icon: 'warning', title: 'Cantidad inválida', text: 'La cantidad debe ser al menos 1.' });
    }

    fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
    })
    .then(r => {
        if (r.ok) {
            window.location.reload();
        } else {
            return r.json().then(data => { throw new Error(data.error || 'Error al actualizar'); });
        }
    })
    .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: err.message }));
}

// Llenar los selects del formulario de actualización masiva
function fillUpdateSelects() {
    document.querySelectorAll('.update-product-select').forEach(sel => {
        if (sel.options.length <= 1) {
            productList.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p._id;
                opt.textContent = `${p.title} - $${p.price}`;
                sel.appendChild(opt);
            });
        }
    });
}

// Agregar una nueva fila de producto al formulario de actualización
function addProductRow() {
    const container = document.getElementById('updateProductsList');
    const row = document.createElement('div');
    row.className = 'input-group mb-2 product-row';
    row.innerHTML = `
        <select class="form-select update-product-select" required>
            <option value="">Seleccionar producto...</option>
        </select>
        <input type="number" class="form-control update-product-qty" min="1" value="1" style="max-width: 80px;" placeholder="Cant." />
        <button type="button" class="btn btn-outline-danger" onclick="this.closest('.product-row').remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(row);
    fillUpdateSelects();
}

// Enviar PUT para reemplazar todos los productos del carrito
function updateCartProducts(cartId) {
    const rows = document.querySelectorAll('#updateProductsList .product-row');
    const products = [];

    for (const row of rows) {
        const productId = row.querySelector('.update-product-select').value;
        const quantity = parseInt(row.querySelector('.update-product-qty').value) || 1;
        if (productId) {
            products.push({ product: productId, quantity });
        }
    }

    if (products.length === 0) {
        return Swal.fire({ icon: 'warning', title: 'Sin productos', text: 'Agregá al menos un producto a la lista.' });
    }

    fetch(`/api/carts/${cartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
    })
    .then(r => {
        if (r.ok) {
            Swal.fire({ icon: 'success', title: 'Carrito actualizado', text: 'Los productos fueron reemplazados.' })
                .then(() => window.location.reload());
        } else {
            return r.json().then(data => { throw new Error(data.error || 'Error al actualizar'); });
        }
    })
    .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: err.message }));
}

