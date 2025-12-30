let jornadas = [];
let jornadaActual = 0;
let horaBase = "";
let tituloTorneo = "";

function generarRol() {
    const equipos = document.getElementById("equipos").value
        .split("\n")
        .map(e => e.trim())
        .filter(e => e !== "");

    tituloTorneo = document.getElementById("torneo").value || "TORNEO";

    horaBase = document.getElementById("horaInicio").value;

    if (equipos.length < 2) {
        alert("Mínimo 2 equipos");
        return;
    }

    jornadas = roundRobin(equipos);
    asignarHorarios();

    jornadaActual = 0;
    renderBotones();
    renderJornada();
    renderCartel();
}

function roundRobin(equipos) {
    let lista = [...equipos];

    if (lista.length % 2 !== 0) {
        lista.push("DESCANSA");
    }

    const n = lista.length;
    let jornadas = [];

    for (let i = 0; i < n - 1; i++) {
        let partidos = [];

        for (let j = 0; j < n / 2; j++) {
            const a = lista[j];
            const b = lista[n - 1 - j];

            partidos.push({
                hora: "",
                a,
                b
            });
        }

        jornadas.push(partidos);
        lista.splice(1, 0, lista.pop());
    }

    return jornadas;
}

function asignarHorarios() {
    jornadas.forEach(jornada => {
        let [h, m] = horaBase.split(":").map(Number);
        jornada.forEach(p => {
            p.hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            h++;
        });
    });
}

function renderBotones() {
    const cont = document.getElementById("botonesJornadas");
    cont.innerHTML = "";

    jornadas.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.textContent = `Jornada ${i + 1}`;
        btn.onclick = () => {
            jornadaActual = i;
            renderJornada();
            renderCartel();
        };
        cont.appendChild(btn);
    });
}

function renderJornada() {
    const cont = document.getElementById("tablaJornada");
    const jornada = jornadas[jornadaActual];

    let html = `<h3>Jornada ${jornadaActual + 1}</h3>
    
    <table>
        <tr>
            <th>Hora</th>
            <th>Equipo A</th>
            <th>Equipo B</th>
            <th>Orden</th>
            <th>Eliminar</th>
        </tr>`;
    

    jornada.forEach((p, j) => {

        if (p.a === "DESCANSA" || p.b === "DESCANSA") {
            const equipo = p.a === "DESCANSA" ? p.b : p.a;
            html += `
            <tr>
                <td colspan="3"><strong>${equipo}</strong> DESCANSA</td>
                <td>
                    <a onclick="moverFila(-1,${j})">⬆️</a>
                    <a onclick="moverFila(1,${j})">⬇️</a>
                </td>
                <td><a onclick="eliminar(${jornadaActual},${j})">❌</a></td>
            </tr>`;
            return;
        }

        html += `
        <tr>
            <td><input value="${p.hora}" onchange="update(${jornadaActual},${j},'hora',this.value)"></td>
            <td><input value="${p.a}" onchange="update(${jornadaActual},${j},'a',this.value)"></td>
            <td><input value="${p.b}" onchange="update(${jornadaActual},${j},'b',this.value)"></td>
            <td>
                <a onclick="moverFila(-1,${j})">⬆️</a>
                <a onclick="moverFila(1,${j})">⬇️</a>
            </td>
            <td><a onclick="eliminar(${jornadaActual},${j})">❌</a></td>
        </tr>`;
    });
    
    html += `</table>`;
    html += `<div class="boton">`;
    html +=     `<button class="btn2" onclick="actualizarJornada()">Actualizar Jornada</button>`;
    html += `</div>`;
    

    cont.innerHTML = html;
}

function actualizarJornada() {
    const jornada = jornadas[jornadaActual];

    jornada.forEach((p, i) => {
        if (p.a !== "DESCANSA" && p.b !== "DESCANSA") {
            p.hora = sumarHora(horaBase, i);
        }
    });

    renderCartel();
}

function sumarHora(hora, horas) {
    let [h, m] = hora.split(":").map(Number);
    h = (h + horas) % 24;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}


function renderCartel() {
    const cartel = document.getElementById("cartel");
    const jornada = jornadas[jornadaActual];

    let html = `<div id="lienzo"  class="cartel-jornada">
        <div class="fondo-Cartel">
            <h2 class="titulo-torneo" style="color: #ffff00;">${tituloTorneo}</h2>
            <h3>Jornada ${jornadaActual + 1}</h3>
            <div class="parrafos">`;
    jornada.forEach(p => {
        if (p.a === "DESCANSA" || p.b === "DESCANSA") {
            const equipo = p.a === "DESCANSA" ? p.b : p.a;
            html += `<p>🟡 ${equipo} DESCANSA</p>`;
        } else {
            html += `<p>${p.hora} - ${p.a} vs ${p.b}</p>`;
        }
    });
        html +=  `</div>`;
        html +=`</div>`;
    html += `</div>`;
    cartel.innerHTML = html;
}


function update(i, j, campo, valor) {
    jornadas[i][j][campo] = valor;
    renderCartel();
}

function eliminar(i, j) {
    jornadas[i].splice(j, 1);

    jornadas[i].forEach((p, idx) => {
        p.hora = sumarHora(horaBase, idx);
    });

    renderJornada();
}

function moverFila(dir, j) {
    const jornada = jornadas[jornadaActual];
    const nuevo = j + dir;

    if (nuevo < 0 || nuevo >= jornada.length) return;

    [jornada[j], jornada[nuevo]] = [jornada[nuevo], jornada[j]];
    renderJornada();
}

function descargarPNG() {
    html2canvas(document.getElementById("lienzo")).then(canvas => {
        const torneo = document.getElementById("torneo").value || "torneo";
        const link = document.createElement("a");
        link.download = `${torneo}_jornada_${jornadaActual + 1}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}



/*const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let jornadas = [];

function generarHorario() {
    partidos = [];

    const equipos = document.getElementById("equipos").value.split("\n");
    let hora = document.getElementById("horaInicio").value;

    for (let i = 0; i < equipos.length; i += 2) {
        if (!equipos[i + 1]) break;

        partidos.push({
            hora: hora,
            equipoA: equipos[i],
            equipoB: equipos[i + 1]
        });

        hora = sumarHora(hora);
    }

    renderTabla();
    dibujarCartel();
}

function sumarHora(hora) {
    let [h, m] = hora.split(":").map(Number);
    h += 1;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
}

function renderTabla() {
    const tbody = document.querySelector("#tablaPartidos tbody");
    tbody.innerHTML = "";

    partidos.forEach((p, index) => {
        tbody.innerHTML += `
            <tr>
                <td><input type="time" value="${p.hora}" onchange="actualizar(${index}, 'hora', this.value)"></td>
                <td><input value="${p.equipoA}" onchange="actualizar(${index}, 'equipoA', this.value)"></td>
                <td><input value="${p.equipoB}" onchange="actualizar(${index}, 'equipoB', this.value)"></td>
                <td>
                    <button class="eliminar" onclick="eliminar(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}







function generarJornadas(equipos) {
    if (equipos.length % 2 !== 0) {
        equipos.push("Descansa");
    }

    const total = equipos.length;
    const jornadas = [];
    const mitad = total / 2;

    let rotacion = [...equipos];

    for (let j = 0; j < total - 1; j++) {
        const partidos = [];

        for (let i = 0; i < mitad; i++) {
            const local = rotacion[i];
            const visitante = rotacion[total - 1 - i];

            if (local !== "Descansa" && visitante !== "Descansa") {
                partidos.push({
                    equipoA: local,
                    equipoB: visitante
                });
            }
        }

        jornadas.push(partidos);

        // rotación (dejamos fijo el primero)
        rotacion = [
            rotacion[0],
            rotacion[total - 1],
            ...rotacion.slice(1, total - 1)
        ];
    }

    return jornadas;
}

function crearJornadas(equipos, horaInicio) {
    const base = generarJornadas(equipos);

    jornadas = base.map((partidos, i) => {
        let hora = horaInicio;

        return {
            numero: i + 1,
            inicio: horaInicio,
            partidos: partidos.map(p => {
                const partido = {
                    hora,
                    equipoA: p.equipoA,
                    equipoB: p.equipoB
                };
                hora = sumarHora(hora);
                return partido;
            })
        };
    });
}

function renderTablaJornadas() {
    const tbody = document.querySelector("#tablaPartidos tbody");
    tbody.innerHTML = "";

    jornadas.forEach((jornada, jIndex) => {
        jornada.partidos.forEach((p, pIndex) => {
            tbody.innerHTML += `
                <tr>
                    <td>J${jornada.numero}</td>
                    <td>
                        <input type="time"
                            value="${p.hora}"
                            onchange="editarHora(${jIndex}, ${pIndex}, this.value)">
                    </td>
                    <td>${p.equipoA}</td>
                    <td>${p.equipoB}</td>
                </tr>
            `;
        });
    });
}









function asignarHorarios(jornadas, horaInicio) {
    return jornadas.map(jornada => {
        let hora = horaInicio;
        return jornada.map(p => {
            const partido = { ...p, hora };
            hora = sumarHora(hora);
            return partido;
        });
    });
}

function renderJornadas(jornadas) {
    const tbody = document.querySelector("#tablaPartidos tbody");
    tbody.innerHTML = "";

    jornadas.forEach((jornada, i) => {
        jornada.forEach(p => {
            tbody.innerHTML += `
                <tr class="jornada">
                    <td>J${i + 1}</td>
                    <td>${p.hora}</td>
                    <td>${p.equipoA}</td>
                    <td>${p.equipoB}</td>
                </tr>
            `;
        });
    });
}










function editarHora(jIndex, pIndex, nuevaHora) {
    jornadas[jIndex].partidos[pIndex].hora = nuevaHora;
    dibujarCartel(jornadas);
}


function actualizar(index, campo, valor) {
    partidos[index][campo] = valor;
    dibujarCartel();
}

function eliminar(index) {
    partidos.splice(index, 1);
    renderTabla();
    dibujarCartel();
}










let jornadaSeleccionada = null;

function cambiarInicioJornada(index) {
    jornadaSeleccionada = index;
}

function actualizarInicioJornada(nuevaHora) {
    if (jornadaSeleccionada === null) return;

    let hora = nuevaHora;
    jornadas[jornadaSeleccionada].inicio = nuevaHora;

    jornadas[jornadaSeleccionada].partidos.forEach(p => {
        p.hora = hora;
        hora = sumarHora(hora);
    });

    renderTablaJornadas();
    dibujarCartel(jornadas);
}










function dibujarCartel(jornadas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = "#000";
    ctx.font = "bold 30px Arial";
    ctx.fillText("TORNEO DE BÁSQUETBOL 🏀", 20, 50);

    let y = 100;

    jornadas.forEach((jornada, i) => {
        ctx.font = "bold 20px Arial";
        ctx.fillText(`JORNADA ${i + 1}`, 20, y);
        y += 30;

        ctx.font = "16px Arial";
        jornada.forEach(p => {
            ctx.fillText(`${p.hora}  ${p.equipoA} vs ${p.equipoB}`, 40, y);
            y += 25;
        });

        y += 20;
    });
}

*/
