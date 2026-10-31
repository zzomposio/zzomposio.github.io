const propiedadesBase = [
    { 
        id: 1, 
        titulo: "Depto Centro Concepción", 
        desc: "2 Dormitorios • 2 Baños • Estacionamiento.", 
        descLarga: "Espectacular departamento en pleno centro de Concepción. Cuenta con living comedor amplio, terraza con vista despejada y piso flotante.",
        precio: 120000000, 
        imagenes: [
            "img/depto-conce-1.jpg", 
            "img/depto-conce-2.jpg",
            "img/depto-conce-3.jpg"
        ]
    },
    { 
        id: 2, 
        titulo: "Loft Remodelado Concepción", 
        desc: "1 Dormitorio • 1 Baño • Excelente conectividad.", 
        descLarga: "Increíble loft completamente remodelado en Concepción. Grandes ventanales, concepto abierto y excelente conectividad. Ideal para profesionales jóvenes o como inversión.", 
        precio: 85000000, 
        imagenes: [
            "img/loft-conce-1.jpg", 
            "img/loft-conce-2.jpg"
        ]
    }
];

let valorUF = 37000;

document.addEventListener("DOMContentLoaded", () => {
    obtenerValorUF();
    renderizarTarjetas();
    verificarSesionGuardada();
});

function obtenerPropiedades() {
    const guardadas = localStorage.getItem('inmobiliaria_propiedades');
    if (!guardadas) {
        localStorage.setItem('inmobiliaria_propiedades', JSON.stringify(propiedadesBase));
        return propiedadesBase;
    }
    return JSON.parse(guardadas);
}

async function obtenerValorUF() {
    try {
        const response = await fetch('https://mindicador.cl/api/uf');
        const data = await response.json();
        valorUF = data.serie[0].valor;
        document.getElementById('valor-uf').textContent = `$${valorUF.toLocaleString('es-CL')}`;
    } catch (error) {
        document.getElementById('valor-uf').textContent = `$${valorUF.toLocaleString('es-CL')} (aprox)`;
    }
    renderizarTarjetas();
}

function convertirAClpAUf(precioPesos) {
    if (!valorUF) return "...";
    return (precioPesos / valorUF).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function changeTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById(tabId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.remove('hidden');
    }

    const targetBtn = document.getElementById(`tab-${tabId}`);
    if (targetBtn) targetBtn.classList.add('active');
}

function renderizarTarjetas() {
    const contenedor = document.getElementById('contenedor-propiedades');
    if (!contenedor) return;

    const propiedades = obtenerPropiedades();
    const tabAdmin = document.getElementById('tab-admin');
    const esAdmin = tabAdmin && !tabAdmin.classList.contains('oculto');

    contenedor.innerHTML = '';

    propiedades.forEach(prop => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between border border-gray-100';
        
        const imagenPrincipal = (prop.imagenes && prop.imagenes.length > 0) ? prop.imagenes[0] : 'https://via.placeholder.com/400x300';

        tarjeta.innerHTML = `
            <div>
                <img src="${imagenPrincipal}" alt="${prop.titulo}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-800">${prop.titulo}</h3>
                    <p class="text-sm text-gray-500 mt-1">${prop.desc}</p>
                    <p class="text-xl font-bold text-blue-600 mt-3">$${prop.precio.toLocaleString('es-CL')}</p>
                    <p class="text-xs text-gray-400">UF ${convertirAClpAUf(prop.precio)}</p>
                </div>
            </div>
            <div class="p-4 pt-0 space-y-2">
                <button onclick="verDetalle(${prop.id})" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition text-sm">
                    Ver Detalles
                </button>
                
                ${esAdmin ? `
                    <div class="flex space-x-2 pt-2 border-t mt-2">
                        <button onclick="cargarDatosEdicion(${prop.id})" class="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 rounded transition">
                             Editar
                        </button>
                        <button onclick="eliminarPropiedad(${prop.id})" class="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded transition">
                             Eliminar
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function verDetalle(id) {
    const propiedades = obtenerPropiedades();
    const prop = propiedades.find(p => p.id === id);
    if (!prop) return;

    const contenedorDetalle = document.getElementById('contenedor-detalle');
    
    let galeriaHTML = '';
    if (prop.imagenes && prop.imagenes.length > 0) {
        galeriaHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                ${prop.imagenes.map(img => `<img src="${img}" class="w-full h-48 object-cover rounded-lg shadow-sm">`).join('')}
            </div>
        `;
    }

    contenedorDetalle.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${prop.titulo}</h2>
        <p class="text-gray-500 mb-4">${prop.desc}</p>
        ${galeriaHTML}
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <p class="text-3xl font-bold text-blue-600">$${prop.precio.toLocaleString('es-CL')}</p>
            <p class="text-sm text-gray-500">Aproximadamente UF ${convertirAClpAUf(prop.precio)}</p>
        </div>
        <h3 class="font-bold text-lg text-gray-800 mb-2">Descripción de la propiedad</h3>
        <p class="text-gray-600 leading-relaxed">${prop.descLarga || 'Sin descripción detallada disponible.'}</p>
    `;

    changeTab('detalle');
}

function cargarDatosEdicion(id) {
    const propiedades = obtenerPropiedades();
    const prop = propiedades.find(p => p.id === id);

    if (!prop) return;

    document.getElementById('editPropiedadId').value = prop.id;
    document.getElementById('nuevoTitulo').value = prop.titulo;
    document.getElementById('nuevaDesc').value = prop.desc;
    document.getElementById('nuevaDescLarga').value = prop.descLarga;
    document.getElementById('nuevoPrecio').value = prop.precio;

    document.getElementById('nuevaImgArchivo').removeAttribute('required');
    document.getElementById('help-fotos-edicion').classList.remove('hidden');

    document.getElementById('titulo-form-admin').textContent = `Editar Anuncio #${prop.id}`;
    document.getElementById('btn-submit-form').textContent = "Guardar Cambios";
    document.getElementById('btn-submit-form').className = "w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-md mt-4 transition text-sm sm:text-base";
    document.getElementById('btn-cancelar-edicion').classList.remove('hidden');

    changeTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
    document.getElementById('editPropiedadId').value = "";
    document.getElementById('form-nueva-propiedad').reset();

    document.getElementById('nuevaImgArchivo').setAttribute('required', 'true');
    document.getElementById('help-fotos-edicion').classList.add('hidden');

    document.getElementById('titulo-form-admin').textContent = "Crear Nuevo Anuncio";
    document.getElementById('btn-submit-form').textContent = "Publicar Propiedad";
    document.getElementById('btn-submit-form').className = "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md mt-4 transition text-sm sm:text-base";
    document.getElementById('btn-cancelar-edicion').classList.add('hidden');
}

async function procesarFormulario(event) {
    event.preventDefault();

    const editId = document.getElementById('editPropiedadId').value;
    let propiedades = obtenerPropiedades();

    const titulo = document.getElementById('nuevoTitulo').value;
    const desc = document.getElementById('nuevaDesc').value;
    const descLarga = document.getElementById('nuevaDescLarga').value;
    const precio = Number(document.getElementById('nuevoPrecio').value);
    const archivos = document.getElementById('nuevaImgArchivo').files;

    let imagenes = [];

    if (archivos.length > 0) {
        imagenes = await procesarArchivosImagen(archivos);
    }

    if (editId) {
        const index = propiedades.findIndex(p => p.id === Number(editId));
        if (index !== -1) {
            if (imagenes.length === 0) {
                imagenes = propiedades[index].imagenes;
            }

            propiedades[index] = {
                id: Number(editId),
                titulo,
                desc,
                descLarga,
                precio,
                imagenes
            };
            alert("¡Publicación actualizada con éxito!");
        }
    } else {
        const nuevoId = propiedades.length > 0 ? Math.max(...propiedades.map(p => p.id)) + 1 : 1;
        propiedades.push({
            id: nuevoId,
            titulo,
            desc,
            descLarga,
            precio,
            imagenes
        });
        alert("¡Nueva propiedad publicada con éxito!");
    }

    localStorage.setItem('inmobiliaria_propiedades', JSON.stringify(propiedades));
    cancelarEdicion();
    renderizarTarjetas();
    changeTab('propiedades');
}

function procesarArchivosImagen(archivos) {
    return Promise.all(Array.from(archivos).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }));
}

function eliminarPropiedad(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta propiedad?")) {
        let propiedades = obtenerPropiedades();
        propiedades = propiedades.filter(p => p.id !== id);
        localStorage.setItem('inmobiliaria_propiedades', JSON.stringify(propiedades));
        renderizarTarjetas();
    }
}

function limpiarBaseDeDatos() {
    if (confirm("¿Seguro que deseas borrar todas tus propiedades y restaurar las iniciales?")) {
        localStorage.removeItem('inmobiliaria_propiedades');
        renderizarTarjetas();
        alert("Base de datos reiniciada.");
    }
}

function iniciarSesion() {
    const clave = prompt("Ingrese la contraseña de dueño:");
    if (clave === "admin123") {
        localStorage.setItem('inmobiliaria_admin', 'true');
        aplicarEstadoSesion(true);
        alert("Sesión iniciada como Dueño.");
    } else if (clave !== null) {
        alert("Contraseña incorrecta.");
    }
}

function cerrarSesion() {
    localStorage.removeItem('inmobiliaria_admin');
    aplicarEstadoSesion(false);
    changeTab('propiedades');
    alert("Sesión cerrada.");
}

function verificarSesionGuardada() {
    const esAdmin = localStorage.getItem('inmobiliaria_admin') === 'true';
    aplicarEstadoSesion(esAdmin);
}

function aplicarEstadoSesion(esAdmin) {
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const tabAdmin = document.getElementById('tab-admin');

    if (esAdmin) {
        if (btnLogin) btnLogin.classList.add('oculto');
        if (btnLogout) btnLogout.classList.remove('oculto');
        if (tabAdmin) tabAdmin.classList.remove('oculto');
    } else {
        if (btnLogin) btnLogin.classList.remove('oculto');
        if (btnLogout) btnLogout.classList.add('oculto');
        if (tabAdmin) tabAdmin.classList.add('oculto');
    }
    renderizarTarjetas();
}

function calcularRentabilidad() {
    const precioCompra = Number(document.getElementById('precioCompra').value) || 0;
    const costoArreglos = Number(document.getElementById('costoArreglos').value) || 0;
    const precioVenta = Number(document.getElementById('precioVenta').value) || 0;

    const inversionTotal = precioCompra + costoArreglos;
    const gananciaNeta = precioVenta - inversionTotal;

    const resultadoDiv = document.getElementById('resultadoCalculadora');
    const inversionSpan = document.getElementById('inversionTotal');
    const gananciaSpan = document.getElementById('gananciaNeta');

    inversionSpan.textContent = `$${inversionTotal.toLocaleString('es-CL')}`;
    gananciaSpan.textContent = `$${gananciaNeta.toLocaleString('es-CL')}`;

    if (gananciaNeta >= 0) {
        resultadoDiv.className = "mt-6 sm:mt-8 p-4 rounded-md bg-green-100 text-green-800 border border-green-200";
    } else {
        resultadoDiv.className = "mt-6 sm:mt-8 p-4 rounded-md bg-red-100 text-red-800 border border-red-200";
    }

    resultadoDiv.classList.remove('hidden');
}