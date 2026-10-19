document.addEventListener("DOMContentLoaded", function () {
    var formulario = document.getElementById("formLogin");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        var usuario = document.getElementById("usuario").value.trim();
        var contrasena = document.getElementById("contrasena").value;
        var rol = document.getElementById("rol").value;
        var mensaje = document.getElementById("mensaje");

        var usuarios = [
            {
                usuario: "admin",
                contrasena: "admin123",
                rol: "Administrador"
            },
            {
                usuario: "almacen",
                contrasena: "almacen123",
                rol: "Almacenista"
            },
            {
                usuario: "cliente",
                contrasena: "cliente123",
                rol: "Cliente"
            }
        ];

        var encontrado = usuarios.find(function (cuenta) {
            return cuenta.usuario === usuario &&
                   cuenta.contrasena === contrasena &&
                   cuenta.rol === rol;
        });

        if (encontrado) {
            localStorage.setItem("usuarioSnak", encontrado.usuario);
            localStorage.setItem("rolSnak", encontrado.rol);

            window.location.href = "index.html";
        } else {
            mensaje.textContent = "Usuario, contraseña o rol incorrectos.";
            mensaje.style.color = "red";
        }
    });
});
