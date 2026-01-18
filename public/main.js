// Función para mostrar/ocultar spinner de carga
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
}

// Función para mostrar modal de mensaje
function showMessageModal(message, type = 'info') {
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    const header = document.getElementById('messageModalHeader');
    const body = document.getElementById('messageModalBody');
    const title = document.getElementById('messageModalLabel');

    body.textContent = message;

    // Cambiar colores según tipo
    header.className = 'modal-header';
    if (type === 'success') {
        header.classList.add('bg-success', 'text-white');
        title.textContent = '¡Éxito!';
    } else if (type === 'error') {
        header.classList.add('bg-danger', 'text-white');
        title.textContent = 'Error';
    } else if (type === 'warning') {
        header.classList.add('bg-warning');
        title.textContent = 'Advertencia';
    } else {
        header.classList.add('bg-info', 'text-white');
        title.textContent = 'Información';
    }

    modal.show();
}

// 1. CAMBIO: El ID debe coincidir con el del nuevo HTML
const form = document.getElementById('createProductForm'); 

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);

    const data = new FormData(form);
    const obj = {};
    
    data.forEach((value, key) => obj[key] = value);

    // --- 2. CAMBIO: Conversión de tipos de datos ---
    // El servidor espera Números, pero el formulario siempre entrega Texto.
    // Convertimos "1500" a 1500 (número real).
    obj.price = Number(obj.price);
    obj.stock = Number(obj.stock);

    // --- 3. CAMBIO: Formato de Imágenes ---
    // El servidor espera un array ["url"], pero el input es un string simple.
    // Si escribieron algo, lo metemos en un array. Si no, mandamos array vacío [].
    obj.thumbnails = obj.thumbnail ? [obj.thumbnail] : [];
    delete obj.thumbnail; // Borramos la propiedad vieja para no ensuciar el objeto

    try {

        const response = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json' 
            }
        });

        const result = await response.json();

        if (response.status === 201) {
            showMessageModal("¡Producto agregado con éxito!", "success");
            console.log(result);
            form.reset(); // Limpiamos el formulario para cargar otro
            loadProducts(); // Recargar la tabla
        } else {
            showMessageModal("Error: " + result.error, "error");
        }

    } catch (error) {
        console.error("Error de red:", error);
        showMessageModal("Error de conexión con el servidor", "error");
    } finally {
        showLoading(false);
    }
});

/* PRUEBA ACTUALIZAR PRODUCTO BUSCADO POR ID */
const updateForm = document.getElementById('updateProductForm');

updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);

    const data = new FormData(updateForm);
    const obj = {};

    // 1. Extraemos los datos del formulario
    data.forEach((value, key) => {
        if (value.trim() !== "") {
            obj[key] = value;
        }
    });

    // 2. Separamos el ID del resto de los datos
    const productId = obj.id;

    // Conversión de tipos (si existen en el objeto)
    if (obj.price) obj.price = Number(obj.price);
    if (obj.stock) obj.stock = Number(obj.stock);
    if (obj.thumbnails) obj.thumbnails = [obj.thumbnails]; // Convertir a array

    try {
        // 3. Enviamos la petición PUT a la URL con el ID
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        const result = await response.json();

        if (response.ok) {
            showMessageModal("¡Producto actualizado!", "success");
            console.log(result);
            updateForm.reset(); // Limpiar formulario
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide(); // Cerrar modal
            loadProducts(); // Recargar tabla
        } else {
            showMessageModal("Error al actualizar: " + (result.error || "ID no encontrado"), "error");
        }

    } catch (error) {
        console.error("Error:", error);
        showMessageModal("Error de conexión", "error");
    } finally {
        showLoading(false);
    }
});

const tableBody = document.getElementById('productsTableBody');

// 1. Función para obtener productos (GET) 
async function loadProducts() {
    showLoading(true);
    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        // Limpiar tabla
        tableBody.innerHTML = '';

        // Dibujar filas
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.title}</td>
                <td>${product.code}</td>
                <td>$${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td><small class="text-muted" style="font-size: 0.7rem">${product.id}</small></td>
                <td><small class="text-muted" style="font-size: 0.7rem">${product.thumbnails ? product.thumbnails.join(', ') : ''}</small></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-warning me-1" 
                        onclick="fillUpdateForm('${product.id}')" 
                        data-bs-toggle="tooltip" 
                        title="Editar producto">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-danger" 
                        onclick="deleteProduct('${product.id}')" 
                        data-bs-toggle="tooltip" 
                        title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Inicializar tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

    } catch (error) {
        console.error("Error cargando la tabla:", error);
    } finally {
        showLoading(false);
    }
}

// 2. Función para eliminar producto
async function deleteProduct(id) {
    if (!confirm(`¿Seguro que deseas eliminar el producto ${id}?`)) return;

    showLoading(true);
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();

        if (response.ok) {
            showMessageModal("Eliminado correctamente", "success");
            loadProducts(); // Recargar la tabla
        } else {
            showMessageModal("Error al eliminar: " + (result.error || result.message), "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessageModal("Error de conexión", "error");
    } finally {
        showLoading(false);
    }
}

// 3. Función auxiliar para abrir el modal y prellenar el formulario de edición
async function fillUpdateForm(id) {
    showLoading(true);
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();

        if (response.ok) {
            document.getElementById('editIdInput').value = product.id;
            updateForm.title.value = product.title;
            updateForm.price.value = product.price;
            updateForm.stock.value = product.stock;
            updateForm.thumbnails.value = product.thumbnails ? product.thumbnails[0] : '';

            const modal = new bootstrap.Modal(document.getElementById('editModal'));
            modal.show();
        } else {
            showMessageModal("Error al cargar producto: " + product.error, "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessageModal("Error de conexión", "error");
    } finally {
        showLoading(false);
    }
}

// Función para buscar producto por ID
async function searchProductById() {
    const id = document.getElementById('searchIdInput').value.trim();
    if (!id) {
        showMessageModal("Por favor, ingresa un ID válido", "warning");
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();

        if (response.ok) {
            const modalBody = document.getElementById('viewModalBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>ID:</strong> ${product.id}</p>
                        <p><strong>Título:</strong> ${product.title}</p>
                        <p><strong>Descripción:</strong> ${product.description}</p>
                        <p><strong>Código:</strong> ${product.code}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Precio:</strong> $${product.price}</p>
                        <p><strong>Stock:</strong> ${product.stock}</p>
                        <p><strong>Categoría:</strong> ${product.category}</p>
                        <p><strong>Estado:</strong> ${product.status ? 'Activo' : 'Inactivo'}</p>
                        ${product.thumbnails && product.thumbnails.length > 0 ? `<p><strong>Imágenes:</strong> ${product.thumbnails.join(', ')}</p>` : ''}
                    </div>
                </div>
            `;

            const modal = new bootstrap.Modal(document.getElementById('viewModal'));
            modal.show();
        } else {
            showMessageModal("Producto no encontrado: " + product.error, "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessageModal("Error de conexión", "error");
    } finally {
        showLoading(false);
    }
}


// 4. Cargar la lista apenas arranca la página
loadProducts();