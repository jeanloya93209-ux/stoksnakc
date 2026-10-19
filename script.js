var url = "https://script.google.com/macros/s/AKfycbzy9ZDS-0YMb0mSxprVanQbUw-MB3FY7RlIdzewYCSZ6tj-bHb2655cdo3_f6qeG77L/exec";

var productos = [];

function cargarProductos() {
    fetch(url)
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error("Error al consultar productos");
            }
            return respuesta.json();
        })
        .then(function(datos) {
            if (!Array.isArray(datos)) {
                throw new Error("La respuesta no contiene una lista de productos");
            }

            productos = datos;
            mostrarTodo();
        })
        .catch(function(error) {
            console.error("Error:", error);
            document.getElementById("productos").innerHTML =
                '<p style="color:red;">No se pudieron cargar los productos. Revisa Google Sheets.</p>';
        });
}

function mostrarTodo() {
    mostrarProductos(productos);
}

function mostrarBajoStock() {
    mostrarProductos(productos.filter(function(producto) {
        return Number(producto[1]) <= 10;
    }));
}

function mostrarStockAlto() {
    mostrarProductos(productos.filter(function(producto) {
        return Number(producto[1]) > 20;
    }));
}

function mostrarPrecioMayor() {
    mostrarProductos(productos.filter(function(producto) {
        return Number(String(producto[2]).replace(/[$,\s]/g, "")) > 1500;
    }));
}

function mostrarPrecioMenor() {
    mostrarProductos(productos.filter(function(producto) {
        return Number(String(producto[2]).replace(/[$,\s]/g, "")) < 1500;
    }));
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
        parrafo.appendChild(document.createTextNode(
            " | Stock: " + producto[1] +
            " | Precio: $" + producto[2]
        ));

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

document.getElementById("formProducto").addEventListener("submit", function(event) {
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

    if (!nombre || stockTexto === "" || precioTexto === "" ||
        !Number.isInteger(stock) || stock < 0 ||
        !Number.isFinite(precio) || precio < 0) {
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
            throw new Error("Respuesta inesperada. Revisa la implementación de Apps Script.");
        }

        if (!resultado.ok) {
            throw new Error(resultado.error || "No se pudo guardar el producto.");
        }

        mensaje.textContent = "Producto guardado correctamente.";
        document.getElementById("formProducto").reset();
        cargarProductos();
    })
    .catch(function(error) {
        console.error("Error al guardar:", error);
        mensaje.textContent = "No se pudo confirmar el guardado: " + error.message;
    });
});

cargarProductos();
