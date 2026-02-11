// Lógica de productos en tiempo real via Socket.io.
const socket = io();
let username = null;

const contenidoTabla = document.getElementById("productsTableBody");
const btn = document.getElementById("addProductButton");

btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const newProduct = {
        title: document.querySelector('input[name="title"]').value,
        description: document.querySelector('input[name="description"]').value,
        code: document.querySelector('input[name="code"]').value,
        price: document.querySelector('input[name="price"]').value,
        stock: document.querySelector('input[name="stock"]').value,
        category: document.querySelector('input[name="category"]').value,
    };

    socket.emit("newProduct", newProduct);
    document.querySelector('input[name="title"]').value = "";
    document.querySelector('input[name="description"]').value = "";
    document.querySelector('input[name="code"]').value = "";
    document.querySelector('input[name="price"]').value = "";
    document.querySelector('input[name="stock"]').value = "";
    document.querySelector('input[name="category"]').value = "";
});

contenidoTabla.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const pid = e.target.dataset.id;
        socket.emit("deleteProduct", pid);
    }
});

Swal.fire({
    title: "¡Bienvenido!",
    text: "Ingresa tu nombre de usuario:",
    input: "text",
    inputValidator: (value) => {
        if (!value) return "Debes ingresar un nombre de usuario";
    },
}).then((input) => {
    username = input.value;
    socket.emit("newUserFront", username);
});

socket.on("newUser", (username) => {
    Toastify({
        text: `${username} se ha unido`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "left",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
    }).showToast();
});

socket.on("products", (products) => {
    contenidoTabla.innerHTML = "";
    const render = products
        .map((prod) => {
            return `<tr>
            <td>${prod.title}</td>
            <td>${prod.description}</td>
            <td>${prod.code}</td>
            <td>$${prod.price}</td>
            <td>${prod.stock}</td>
            <td>${prod.category}</td>
            <td><button class="btn btn-danger delete-btn" data-id="${prod.id}">Eliminar</button></td>
        </tr>`;
        })
        .join("");

    contenidoTabla.innerHTML = render;
});
