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
    
    // Redirigir a la página de detalle del producto
    window.location.href = `/products/${productId}`;
}

// Función de confirmación de eliminación
function confirmDelete(event, form) {
    event.preventDefault();
    
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
            form.submit();
        }
    });
    
    return false;
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

