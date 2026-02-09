// Script compartido para todas las vistas: maneja búsquedas rápidas,
// confirmaciones con SweetAlert y la lógica del panel en tiempo real.
function searchProductById() {
    const input = document.getElementById('searchIdInput');
    const id = input.value.trim();
    if (!id) return;
    window.location.href = '/products/' + id;
}

// ===== Confirmaciones con SweetAlert =====
function confirmDelete(e, formEl) {
    e.preventDefault();
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el producto permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) formEl.submit();
    });
    return false;
}

function confirmDeleteCart(e, formEl) {
    e.preventDefault();
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el carrito permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) formEl.submit();
    });
    return false;
}

// ===== Tiempo Real con WebSocket (solo en /realtimeproducts) =====
const form = document.getElementById('createProductForm');
if (form && typeof io !== 'undefined') {
    const socket = io();

    const tbody = document.getElementById('productsTableBody');
    const countBadge = document.getElementById('productsCount');
    const mainContent = document.querySelector('.row');

    // Bloquear la página hasta que el usuario se registre
    if (mainContent) mainContent.style.pointerEvents = 'none';
    if (mainContent) mainContent.style.opacity = '0.3';

    let currentUser = null;

    async function askForUsername() {
        const { value: name } = await Swal.fire({
            title: '¡Bienvenido!',
            text: 'Ingresá tu nombre para continuar:',
            input: 'text',
            inputPlaceholder: 'Tu nombre...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Debes ingresar un nombre para continuar';
                }
            }
        });

        currentUser = name.trim();
        if (mainContent) mainContent.style.pointerEvents = 'auto';
        if (mainContent) mainContent.style.opacity = '1';

        Swal.fire({
            icon: 'success',
            title: `¡Hola ${currentUser}!`,
            text: 'Ya podés gestionar productos en tiempo real.',
            timer: 2000,
            showConfirmButton: false
        });
    }

    askForUsername();

    function renderProducts(products) {
        if (!products || products.length === 0) {
            tbody.innerHTML = `
                <tr id="emptyRow">
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                        No hay productos cargados aún.
                    </td>
                </tr>`;
        } else {
            tbody.innerHTML = products.map(p => `
                <tr id="product-${p.id}">
                    <td>${p.title}</td>
                    <td>${p.code}</td>
                    <td>$${p.price}</td>
                    <td>${p.stock}</td>
                    <td>${p.category}</td>
                    <td>${p.createdBy || 'Sin registrar'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        if (countBadge) {
            countBadge.textContent = `${products ? products.length : 0} productos`;
        }
    }

    socket.on('updateProducts', (products) => {
        renderProducts(products);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.price = Number(data.price);
        data.stock = Number(data.stock);
        if (currentUser) {
            data.createdBy = currentUser;
        }

        try {
            const res = await fetch('/api/realtime/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                form.reset();
                Swal.fire({ icon: 'success', title: 'Producto creado', text: 'El producto se agregó correctamente.', timer: 2000, showConfirmButton: false });
            } else {
                const body = await res.json().catch(() => ({}));
                Swal.fire({ icon: 'error', title: 'Error', text: body.error || 'Error al crear producto' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
    });
}

async function deleteProduct(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el producto permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
        const res = await fetch(`/api/realtime/products/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            Swal.fire({ icon: 'error', title: 'Error', text: body.error || 'Error al eliminar producto' });
        } else {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El producto fue eliminado.', timer: 2000, showConfirmButton: false });
        }
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
    }
}