var url = "https://script.google.com/macros/s/AKfycbzy9ZDS-0YMb0mSxprVanQbUw-MB3FY7RlIdzewYCSZ6tj-bHb2655cdo3_f6qeG77L/exec";

var productos = [];

function cargarProductos() {
    var contenedor = document.getElementById("productos");
    contenedor.textContent = "Cargando productos...";

    fetch(url)
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error("Error al consultar productos.");
            }
            return respuesta.json();
        })
        .then(function(datos) {
            if (!Array.isArray(datos)) {
                throw new Error(
                    datos.error || "La respuesta no contiene una lista de productos."
                );
            }

            productos = datos;
            mostrarTodo();
        })
        .catch(function(error) {
            console.error("Error:", error);
            contenedor.innerHTML =
                '<p style="color:red;">No se pudieron cargar los productos. Revisa Google Sheets y Apps Script.</p>';
        });
}

function mostrarTodo() {
    mostrarProductos(productos);
}

function mostrarBajoStock() {
    var filtrados = productos.filter(function(producto) {
        return Number(producto[1]) <= 10;
    });

    mostrarProductos(filtrados);
}

function mostrarStockAlto() {
    var filtrados = productos.filter(function(producto) {
        return Number(producto[1]) > 20;
    });

    mostrarProductos(filtrados);
}

function obtenerPrecio(producto) {
    return Number(
        String(producto[2]).replace(/[$,\s]/g, "")
    );
}

function mostrarPrecioMayor() {
    var filtrados = productos.filter(function(producto) {
        return obtenerPrecio(producto) > 20;
    });

    mostrarProductos(filtrados);
}

function mostrarPrecioMenor() {
    var filtrados = productos.filter(function(producto) {
        return obtenerPrecio(producto) < 20;
    });

    mostrarProductos(filtrados);
}

function mostrarProductos(lista) {
    var contenedor = document.getElementById("productos");
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

        parrafo.appendChild(
            document.createTextNode(
                " | Stock: " + producto[1] +
                " | Precio: $" + producto[2]
            )
        );

        contenedor.appendChild(parrafo);
    });
}

function abrirFormulario() {
    if (localStorage.getItem("rolSnak") !== "Administrador") {
        alert("Solo el administrador puede agregar productos.");
        return;
    }

    document.getElementById("formularioNuevo").style.display = "block";
    document.getElementById("mensajeProducto").textContent = "";
}

function cerrarFormulario() {
    document.getElementById("formularioNuevo").style.display = "none";
    document.getElementById("formProducto").reset();
    document.getElementById("mensajeProducto").textContent = "";
}

document.getElementById("formProducto").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        var mensaje = document.getElementById("mensajeProducto");

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
            if (!respuesta.ok) {
                throw new Error("Error de comunicación con Apps Script.");
            }

            return respuesta.text();
        })
        .then(function(texto) {
            var resultado;

            try {
                resultado = JSON.parse(texto);
            } catch (error) {
                throw new Error(
                    "La respuesta no es válida. Revisa Apps Script."
                );
            }

            if (!resultado.ok) {
                throw new Error(
                    resultado.error || "No se pudo guardar el producto."
                );
            }

            mensaje.textContent = "Producto guardado correctamente.";

            document.getElementById("formProducto").reset();

            return cargarProductos();
        })
        .catch(function(error) {
            console.error("Error al guardar:", error);

            mensaje.textContent =
                "No se pudo confirmar el guardado: " + error.message;
        });
    }
);

cargarProductos();
