// Función para navegar utilizando fetch
function navigateTo(url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.documentElement.innerHTML = html;
            window.history.pushState({}, '', url);
        })
        .catch(err => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error en la navegación' });
            console.error(err);
        });
}

// Función para buscar producto por ID
function searchProductById() {
    const input = document.getElementById('searchIdInput');
    const productId = input.value.trim();
    
    if (!productId) {
        Swal.fire({
            icon: 'warning',
            title: 'ID requerido',
            text: 'Por favor ingresa un ID de producto',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // Navegar a la página de detalle del producto usando fetch
    navigateTo(`/products/api/${productId}`);
}

// Función para actualizar producto
function updateProduct(event, productId) {
    event.preventDefault();
    const form = document.getElementById('updateForm');
    const formData = new FormData(form);
    const body = Object.fromEntries(formData);

    fetch(`/products/api/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(r => {
        if (r.ok) {
            navigateTo(`/products/api/${productId}`);
        } else {
            throw new Error('Error al actualizar');
        }
    })
    .catch(err => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el producto' });
    });
}

// Función para eliminar producto
function deleteProduct(productId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/products/api/${productId}`, { method: 'DELETE' })
                .then(r => {
                    if (r.ok) {
                        navigateTo('/products/api/view');
                    } else {
                        throw new Error('Error al eliminar');
                    }
                })
                .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' }));
        }
    });
}

// Vincular el formulario de búsqueda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchProductById();
        });
    }
});

