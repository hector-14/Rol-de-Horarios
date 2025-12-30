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


