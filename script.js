
var url = "https://script.google.com/macros/s/AKfycbzy9ZDS-0YMb0mSxprVanQbUw-MB3FY7RlIdzewYCSZ6tj-bHb2655cdo3_f6qeG77L/exec";

var productos = [];

// VERIFICAR INICIO DE SESIÓN
if (!localStorage.getItem("usuarioSnak")) {
    window.location.replace("login.html");
}

// CARGAR PRODUCTOS
function cargarProductos() {
    var contenedor = document.getElementById("productos");

    if (!contenedor) return Promise.resolve();

    contenedor.textContent = "Cargando productos...";

    return fetch(url)
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error("Error al consultar Google Sheets.");
            }

            return respuesta.json();
        })
        .then(function(datos) {
            if (!Array.isArray(datos)) {
                throw new Error(
                    datos.error || "La respuesta no contiene productos."
                );
            }

            productos = datos;
            mostrarTodo();
        })
        .catch(function(error) {
            console.error(error);
            contenedor.textContent =
                "No se pudieron cargar los productos. Revisa la conexión.";
        });
}

// MOSTRAR TODOS
function mostrarTodo() {
    mostrarProductos(productos);
}

// STOCK MENOR O IGUAL A 10
function mostrarBajoStock() {
    mostrarProductos(productos.filter(function(producto) {
        return Number(producto[1]) <= 10;
    }));
}

// STOCK MAYOR A 20
function mostrarStockAlto() {
    mostrarProductos(productos.filter(function(producto) {
        return Number(producto[1]) > 20;
    }));
}

// CONVERTIR PRECIO A NÚMERO
function obtenerPrecio(producto) {
    return Number(String(producto[2]).replace(/[$,\s]/g, ""));
}

// PRECIO MAYOR A $20
function mostrarPrecioMayor() {
    mostrarProductos(productos.filter(function(producto) {
        return Number.isFinite(obtenerPrecio(producto)) &&
            obtenerPrecio(producto) > 20;
    }));
}

// PRECIO MENOR A $20
function mostrarPrecioMenor() {
    mostrarProductos(productos.filter(function(producto) {
        return Number.isFinite(obtenerPrecio(producto)) &&
            obtenerPrecio(producto) < 20;
    }));
}

// MOSTRAR PRODUCTOS
function mostrarProductos(lista) {
    var contenedor = document.getElementById("productos");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        contenedor.textContent = "No hay productos para mostrar.";
        return;
    }

    lista.forEach(function(producto) {
        var parrafo = document.createElement("p");
        var nombre = document.createElement("strong");

        nombre.textContent = producto[0];
        parrafo.appendChild(nombre);

        parrafo.appendChild(document.createTextNode(
            " | Stock: " + producto[1] +
            " | Precio: $" + producto[2]
        ));

        contenedor.appendChild(parrafo);
    });
}

// ABRIR FORMULARIO
function abrirFormulario() {
    if (!localStorage.getItem("usuarioSnak")) {
        window.location.replace("login.html");
        return;
    }

    if (localStorage.getItem("rolSnak") !== "Administrador") {
        alert("Solo el administrador puede agregar productos.");
        return;
    }

    document.getElementById("formularioNuevo").style.display = "block";
    document.getElementById("mensajeProducto").textContent = "";
}

// CERRAR FORMULARIO
function cerrarFormulario() {
    document.getElementById("formularioNuevo").style.display = "none";
    document.getElementById("formProducto").reset();
    document.getElementById("mensajeProducto").textContent = "";
}

// GUARDAR PRODUCTO NUEVO
var formulario = document.getElementById("formProducto");

if (formulario) {
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        var mensaje = document.getElementById("mensajeProducto");

        if (!localStorage.getItem("usuarioSnak")) {
            window.location.replace("login.html");
            return;
        }

        if (localStorage.getItem("rolSnak") !== "Administrador") {
            alert("Solo el administrador puede agregar productos.");
            return;
        }

        var nombre = document.getElementById("nombreProducto").value.trim();
        var stockTexto = document.getElementById("stockProducto").value;
        var precioTexto = document.getElementById("precioProducto").value;

        var stock = Number(stockTexto);
        var precio = Number(precioTexto);

        if (
            !nombre ||
            stockTexto === "" ||
            precioTexto === "" ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            !Number.isFinite(precio) ||
            precio < 0
        ) {
            mensaje.textContent = "Revisa los datos del producto.";
            return;
        }

        mensaje.textContent = "Guardando producto...";

        var datos = new URLSearchParams();
        datos.append("accion", "agregar");
        datos.append("nombre", nombre);
        datos.append("stock", String(stock));
        datos.append("precio", String(precio));

        fetch(url, {
            method: "POST",
            body: datos
        })
        .then(function(respuesta) {
            return respuesta.text();
        })
        .then(function(texto) {
            var resultado;

            try {
                resultado = JSON.parse(texto);
            } catch (error) {
                throw new Error(
                    "Respuesta inválida. Revisa la función doPost de Apps Script."
                );
            }

            if (!resultado.ok) {
                throw new Error(
                    resultado.error || "No se pudo guardar el producto."
                );
            }

            document.getElementById("formProducto").reset();
            mensaje.textContent = "Producto guardado correctamente.";

            return cargarProductos();
        })
        .catch(function(error) {
            console.error("Error al guardar:", error);
            mensaje.textContent = "Error al guardar: " + error.message;
        });
    });
}

// INICIAR
cargarProductos();
