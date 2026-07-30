/**
 * js/app.js - Controlador principal con banco de 9 nombres y reordenamiento en tiempo real
 */

const { createApp, ref, computed, onMounted } = Vue;
import { CARTAS_POR_GRUPO, LISTA_EVENTOS_BONO } from './data/cartasData.js';
import { REGLAS_GENERALES } from './data/reglasData.js';
import { calcularPuntajeRonda, calcularBonoReglaFranco } from './engine/scoreEngine.js';

createApp({
  setup() {
    const pantallaActual = ref('inicio');
    const hayPartidaGuardada = ref(false);
    const mostrarPodio = ref(false);
    const acordeonAbierto = ref('general');

    // Mesa por defecto: 2 jugadores (Franco y Simón). Banco con los 9 nombres oficiales.
    const cantidadJugadores = ref(2);
    const bancoNombres = ['Franco', 'Simón', 'Nese', 'Punga', 'Eguren', 'Negreano', 'Martina', 'Ledesma', 'Andrada'];
    const nombresJugadores = ref(['Franco', 'Simón']);
    
    const usarReglaFranco = ref(false);
    const usarHabilidadesPiratas = ref(true);
    const usarModoBribon = ref(false);

    // Estado del juego
    const rondaActual = ref(1);
    const jugadores = ref([]);
    const jugadorSeleccionadoIdx = ref(0);
    const historialPartidas = ref([]);

    const catalogoEventosBono = ref(LISTA_EVENTOS_BONO);

    const jugadorActual = computed(() => {
      return jugadores.value[jugadorSeleccionadoIdx.value] || null;
    });

    const indiceJugadorInicial = computed(() => {
      if (!jugadores.value.length) return 0;
      return (rondaActual.value - 1) % jugadores.value.length;
    });

    const jugadorInicial = computed(() => {
      return jugadores.value[indiceJugadorInicial.value] || { nombre: '-' };
    });

    const jugadorReparte = computed(() => {
      if (!jugadores.value.length) return { nombre: '-' };
      const pos = (indiceJugadorInicial.value - 1 + jugadores.value.length) % jugadores.value.length;
      return jugadores.value[pos];
    });

    const tablaGeneralOrdenada = computed(() => {
      return [...jugadores.value].sort((a, b) => b.puntos - a.puntos);
    });

    const puntajeProyectadoActual = computed(() => {
      if (!jugadorActual.value) return 0;
      const res = calcularPuntajeRonda(
        jugadorActual.value.apuesta,
        jugadorActual.value.ganadas,
        rondaActual.value,
        jugadorActual.value.eventosBono,
        usarModoBribon.value,
        jugadorActual.value.modoEnvite
      );
      return res.puntajeTotal;
    });

    // --- CONFIGURACIÓN Y REORDENAMIENTO ---
    const toggleAcordeon = (id) => {
      acordeonAbierto.value = acordeonAbierto.value === id ? null : id;
    };

    const cambiarCantidadJugadores = (num) => {
      cantidadJugadores.value = num;
      const nuevaLista = [];
      for (let i = 0; i < num; i++) {
        nuevaLista.push(bancoNombres[i] || `Pirata ${i + 1}`);
      }
      nombresJugadores.value = nuevaLista;
    };

    const moverJugador = (idx, direccion) => {
      const nuevoIdx = idx + direccion;
      if (nuevoIdx >= 0 && nuevoIdx < nombresJugadores.value.length) {
        const copia = [...nombresJugadores.value];
        const aux = copia[idx];
        copia[idx] = copia[nuevoIdx];
        copia[nuevoIdx] = aux;
        nombresJugadores.value = copia;
      }
    };

    const irANuevaPartida = () => {
      cambiarCantidadJugadores(2);
      pantallaActual.value = 'nueva_partida';
    };

    const comenzarPartida = () => {
      jugadores.value = nombresJugadores.value.slice(0, cantidadJugadores.value).map(nombre => ({
        nombre: nombre || 'Pirata',
        puntos: 0,
        apuesta: 0,
        ganadas: 0,
        modoEnvite: 'metralla',
        eventosBono: {},
        cartasBlancas: 0
      }));
      rondaActual.value = 1;
      jugadorSeleccionadoIdx.value = 0;
      pantallaActual.value = 'partida';
      guardarEnCelular();
    };

    // --- LÍMITES MATEMÁTICOS GLOBALES EN LA MESA ---
    const obtenerCantidadBono = (idEvento) => {
      if (!jugadorActual.value || !jugadorActual.value.eventosBono) return 0;
      return Number(jugadorActual.value.eventosBono[idEvento]) || 0;
    };

    const obtenerMaximoDisponible = (idEvento) => {
      const regla = LISTA_EVENTOS_BONO.find(r => r.id === idEvento);
      if (!regla || !regla.maximo) return 99;

      let totalUsadoMesa = 0;
      jugadores.value.forEach(j => {
        if (j.eventosBono && j.eventosBono[idEvento]) {
          totalUsadoMesa += Number(j.eventosBono[idEvento]) || 0;
        }
      });

      const usadoPorOtros = totalUsadoMesa - obtenerCantidadBono(idEvento);
      return Math.max(0, regla.maximo - usadoPorOtros);
    };

    const cambiarCantidadBono = (idEvento, delta) => {
      if (!jugadorActual.value) return;
      if (!jugadorActual.value.eventosBono) {
        jugadorActual.value.eventosBono = {};
      }
      const actual = obtenerCantidadBono(idEvento);
      const maximoPosible = obtenerMaximoDisponible(idEvento);
      
      let nuevoValor = actual + delta;
      if (nuevoValor < 0) nuevoValor = 0;
      if (nuevoValor > maximoPosible) nuevoValor = maximoPosible;
      
      jugadorActual.value.eventosBono[idEvento] = nuevoValor;
    };

    // --- TURNOS Y RONDAS ---
    const guardarJugadorYContinuar = () => {
      guardarEnCelular();
      if (jugadorSeleccionadoIdx.value < jugadores.value.length - 1) {
        jugadorSeleccionadoIdx.value++;
      } else {
        procesarFinDeRonda();
      }
    };

    const procesarFinDeRonda = () => {
      jugadores.value.forEach(j => {
        const res = calcularPuntajeRonda(j.apuesta, j.ganadas, rondaActual.value, j.eventosBono, usarModoBribon.value, j.modoEnvite);
        j.puntos += res.puntajeTotal;
        j.apuesta = 0;
        j.ganadas = 0;
        j.modoEnvite = 'metralla';
        j.eventosBono = {};
      });

      if (rondaActual.value < 10) {
        rondaActual.value++;
        jugadorSeleccionadoIdx.value = indiceJugadorInicial.value;
        guardarEnCelular();
      } else {
        if (usarReglaFranco.value) {
          jugadores.value.forEach(j => {
            j.puntos += calcularBonoReglaFranco(j.cartasBlancas);
          });
        }

        const nuevaEntrada = {
          fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          ranking: tablaGeneralOrdenada.value.map(j => ({ nombre: j.nombre, puntos: j.puntos }))
        };
        historialPartidas.value.unshift(nuevaEntrada);
        localStorage.setItem('skullking_historial', JSON.stringify(historialPartidas.value));
        localStorage.removeItem('skullking_guardado');
        hayPartidaGuardada.value = false;
        mostrarPodio.value = true;
      }
    };

    const descartarPartidaActual = () => {
      if (confirm('¿Estás seguro de que querés descartar y eliminar la partida actual?')) {
        localStorage.removeItem('skullking_guardado');
        hayPartidaGuardada.value = false;
        pantallaActual.value = 'inicio';
      }
    };

    const cerrarPodio = () => {
      mostrarPodio.value = false;
      pantallaActual.value = 'inicio';
    };

    const guardarEnCelular = () => {
      localStorage.setItem('skullking_guardado', JSON.stringify({
        jugadores: jugadores.value,
        rondaActual: rondaActual.value,
        usarReglaFranco: usarReglaFranco.value,
        usarHabilidadesPiratas: usarHabilidadesPiratas.value,
        usarModoBribon: usarModoBribon.value
      }));
      hayPartidaGuardada.value = true;
    };

    const eliminarPartidaHistorial = (idx) => {
      historialPartidas.value.splice(idx, 1);
      localStorage.setItem('skullking_historial', JSON.stringify(historialPartidas.value));
    };

    const borrarTodoElHistorial = () => {
      if (confirm('¿Estás seguro de que querés borrar todo el historial de partidas?')) {
        historialPartidas.value = [];
        localStorage.removeItem('skullking_historial');
      }
    };

    onMounted(() => {
      const guardado = localStorage.getItem('skullking_guardado');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        hayPartidaGuardada.value = true;
        if (parsed.jugadores) jugadores.value = parsed.jugadores;
        if (parsed.rondaActual) rondaActual.value = parsed.rondaActual;
        if (parsed.usarReglaFranco !== undefined) usarReglaFranco.value = parsed.usarReglaFranco;
        if (parsed.usarHabilidadesPiratas !== undefined) usarHabilidadesPiratas.value = parsed.usarHabilidadesPiratas;
        if (parsed.usarModoBribon !== undefined) usarModoBribon.value = parsed.usarModoBribon;
      }
      const hist = localStorage.getItem('skullking_historial');
      if (hist) {
        historialPartidas.value = JSON.parse(hist);
      }
    });

    return {
      pantallaActual,
      hayPartidaGuardada,
      mostrarPodio,
      acordeonAbierto,
      cantidadJugadores,
      nombresJugadores,
      usarReglaFranco,
      usarHabilidadesPiratas,
      usarModoBribon,
      rondaActual,
      jugadores,
      jugadorSeleccionadoIdx,
      jugadorActual,
      jugadorInicial,
      jugadorReparte,
      tablaGeneralOrdenada,
      historialPartidas,
      catalogoEventosBono,
      cartasPorGrupo: CARTAS_POR_GRUPO,
      reglasGenerales: REGLAS_GENERALES,
      puntajeProyectadoActual,
      toggleAcordeon,
      cambiarCantidadJugadores,
      moverJugador,
      irANuevaPartida,
      comenzarPartida,
      cambiarCantidadBono,
      obtenerCantidadBono,
      obtenerMaximoDisponible,
      calcularBonoBlancas: calcularBonoReglaFranco,
      calcularPuntosRonda: () => puntajeProyectadoActual.value,
      guardarJugadorYContinuar,
      descartarPartidaActual,
      cerrarPodio,
      eliminarPartidaHistorial,
      borrarTodoElHistorial
    };
  }
}).mount('#app');