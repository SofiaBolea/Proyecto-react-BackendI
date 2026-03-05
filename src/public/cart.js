// Lógica del carrito: carga productos en el select y maneja el submit del form.
const form = document.getElementById('addToCartForm');
const select = document.getElementById('productSelect');
const cartId = form?.dataset.cartId;

// Cargar productos desde la API
fetch('/products/api')
    .then(r => r.json())
    .then(products => {
        products.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p._id;
            opt.textContent = `${p.title} - $${p.price}`;
            select.appendChild(opt);
        });
    });

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pid = select.value;
    if (!pid) return Swal.fire({ icon: 'warning', title: 'Atención', text: 'Seleccioná un producto antes de agregar.' });
    form.action = `/carts/api/${cartId}/product/${pid}`;
    form.submit();
});

