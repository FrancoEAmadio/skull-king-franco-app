/**
 * js/app.js - Controlador principal de la PWA Skull King
 * Corrección de lógica global para Cartas Únicas (Skull King y Davy Jones).
 */

const { createApp, ref, computed, onMounted } = Vue;

import { LISTA_EVENTOS_BONO, CATALAGO_CARTAS_WIKI } from './datos/cartasDatos.js';
import { CATEGORIAS_REGLAS_WIKI } from './datos/reglasDatos.js';
import { 
  calcularPuntajeRonda, 
  calcularBonoComodines, 
  procesarAlianzasBotin 
} from './motor/motorPuntuacion.js';

createApp({
  setup() {
    const pantallaActual = ref('inicio');
    const hayPartidaGuardada = ref(false);
    const mostrarPodio = ref(false);
    const partidaFinalizada = ref(false);
    const menuHamburguesaAbierto = ref(false);
    
    const vistaWiki = ref('manual');
    const acordeonAbierto = ref('puntuacion');
    const terminoBusquedaCarta = ref('');
    const filtroTipoCarta = ref('Todos');
    const categoriasReglas = ref(CATEGORIAS_REGLAS_WIKI);

    const cantidadJugadores = ref(2);
    const bancoNombres = ['Franco', 'Simón', 'Nese', 'Punga', 'Eguren', 'Negreano', 'Martina', 'Ledesma', 'Andrada'];
    const nombresJugadores = ref(['Franco', 'Simón']);
    
    const configuracionMesa = ref({
      modoContenido: 'expansion', // 'base' | 'avanzado' | 'expansion'
      usarComodinesBonificacion: false,
      usarHabilidadesPiratas: true,
      usarModoBribon: false
    });

    const rondaActual = ref(1);
    const jugadores = ref([]);
    const jugadorSeleccionadoIdx = ref(0);
    const historialPartidas = ref([]);

    const alianzasBotinRonda = ref([]);

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
        configuracionMesa.value.usarModoBribon,
        jugadorActual.value.modoEnvite
      );
      return res.puntajeTotal;
    });

    const textoBotonAvanzar = computed(() => {
      if (jugadorSeleccionadoIdx.value < jugadores.value.length - 1) {
        return 'Siguiente Jugador ➔';
      }
      if (rondaActual.value < 10) {
        return 'Siguiente Ronda ➔';
      }
      return '🏁 Finalizar Partida';
    });

    const catalogoEventosFiltrado = computed(() => {
      return LISTA_EVENTOS_BONO.filter(ev => {
        if (configuracionMesa.value.modoContenido === 'base') {
          return !['ocho_expansion', 'siete_expansion', 'alianza_botin', 'monstruo_davy'].includes(ev.id);
        }
        if (configuracionMesa.value.modoContenido === 'avanzado') {
          return !['ocho_expansion', 'siete_expansion'].includes(ev.id);
        }
        return true;
      });
    });

    const catalogoCartasFiltrado = computed(() => {
      return CATALAGO_CARTAS_WIKI.filter(c => {
        const coincideTexto = c.nombre.toLowerCase().includes(terminoBusquedaCarta.value.toLowerCase()) ||
                              c.descripcion.toLowerCase().includes(terminoBusquedaCarta.value.toLowerCase());
        const coincideFiltro = filtroTipoCarta.value === 'Todos' || c.modo === filtroTipoCarta.value;
        return coincideTexto && coincideFiltro;
      });
    });

    const limiteBazasAlcanzado = computed(() => {
      let sumaBazasOtras = 0;
      let sumaComodinesOtras = 0;

      jugadores.value.forEach((j, index) => {
        if (index !== jugadorSeleccionadoIdx.value) {
          sumaBazasOtras += (Number(j.ganadas) || 0);
          sumaComodinesOtras += (Number(j.cartasBlancas) || 0);
        }
      });

      const bazasDisponibles = rondaActual.value - sumaBazasOtras;
      const maxComodinesPermitidos = configuracionMesa.value.modoContenido === 'base' ? 4 : 8;
      const comodinesDisponibles = maxComodinesPermitidos - sumaComodinesOtras;

      return {
        bazasDisponibles: Math.max(0, bazasDisponibles),
        bazasGanadasBloqueadas: (sumaBazasOtras + (Number(jugadorActual.value?.ganadas) || 0)) >= rondaActual.value,
        comodinesDisponibles: Math.max(0, comodinesDisponibles),
        comodinesBloqueados: (sumaComodinesOtras + (Number(jugadorActual.value?.cartasBlancas) || 0)) >= maxComodinesPermitidos,
        maxComodinesPermitidos
      };
    });

    const esBotonBazaDeshabilitado = (numero) => {
      if (!jugadorActual.value) return false;
      return numero > limiteBazasAlcanzado.value.bazasDisponibles;
    };

    const seleccionarBazasGanadas = (numero) => {
      if (!esBotonBazaDeshabilitado(numero) && jugadorActual.value) {
        jugadorActual.value.ganadas = numero;
      }
    };

    const toggleAcordeon = (id) => {
      acordeonAbierto.value = acordeonAbierto.value === id ? null : id;
    };

    const cambiarCantidadJugadores = (num) => {
      if (num === 9 && configuracionMesa.value.modoContenido !== 'expansion') {
        return;
      }
      cantidadJugadores.value = num;
      const nuevaLista = [];
      for (let i = 0; i < num; i++) {
        nuevaLista.push(bancoNombres[i] || `Pirata ${i + 1}`);
      }
      nombresJugadores.value = nuevaLista;
    };

    const cambiarModoContenido = (modo) => {
      configuracionMesa.value.modoContenido = modo;
      if (modo !== 'expansion' && cantidadJugadores.value === 9) {
        cambiarCantidadJugadores(8);
      }
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
        apuestaBribon: 0,
        eventosBono: {},
        cartasBlancas: 0
      }));
      rondaActual.value = 1;
      jugadorSeleccionadoIdx.value = 0;
      alianzasBotinRonda.value = [];
      partidaFinalizada.value = false;
      pantallaActual.value = 'partida';
      guardarEnCelular();
    };

    // --- GESTIÓN DE BONIFICACIONES (CORRECCIÓN DE CARTAS ÚNICAS) ---
    const obtenerCantidadBono = (idEvento) => {
      if (!jugadorActual.value || !jugadorActual.value.eventosBono) return 0;
      return Number(jugadorActual.value.eventosBono[idEvento]) || 0;
    };

    const obtenerMaximoDisponible = (idEvento) => {
      const actual = obtenerCantidadBono(idEvento);

      // Regla especial Botín: máximo 2 por jugador, máximo 4 en toda la ronda
      if (idEvento === 'alianza_botin') {
        let totalUsadoMesa = 0;
        jugadores.value.forEach(j => {
          if (j.eventosBono && j.eventosBono.alianza_botin) {
            totalUsadoMesa += Number(j.eventosBono.alianza_botin) || 0;
          }
        });
        const usadoPorOtros = totalUsadoMesa - actual;
        const disponibleRonda = Math.max(0, 4 - usadoPorOtros);
        return Math.min(2, disponibleRonda);
      }

      const regla = LISTA_EVENTOS_BONO.find(r => r.id === idEvento);
      if (!regla || !regla.maximo) return 99;

      let totalUsadoMesa = 0;
      jugadores.value.forEach(j => {
        if (j.eventosBono && j.eventosBono[idEvento]) {
          totalUsadoMesa += Number(j.eventosBono[idEvento]) || 0;
        }
      });

      const usadoPorOtros = totalUsadoMesa - actual;

      // =========================================================================
      // REGLA DE CARTAS ÚNICAS: Skull King y Davy Jones solo existen 1 vez en el mazo.
      // Si cualquier otro jugador ya registró al menos 1 captura con esa carta en esta
      // ronda (usadoPorOtros > 0), el máximo disponible para este jugador es 0.
      // =========================================================================
      if (['pirata_por_sk', 'monstruo_davy'].includes(idEvento)) {
        if (usadoPorOtros > 0) {
          return 0;
        }
      }

      // Para cartas múltiples (Sirenas, 14s, 8s, 7s, etc.), controla el remanente físico
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

    const borrarBonoInmediato = (idEvento) => {
      if (jugadorActual.value && jugadorActual.value.eventosBono) {
        jugadorActual.value.eventosBono[idEvento] = 0;
      }
    };

    const limpiarTodosLosEventos = () => {
      if (jugadorActual.value) {
        jugadorActual.value.eventosBono = {};
      }
    };

    const agregarAlianzaBotin = (idxA, idxB) => {
      if (idxA === undefined || idxB === undefined || idxA === idxB) return;
      if (alianzasBotinRonda.value.length >= 2) return;
      alianzasBotinRonda.value.push({ idxA: Number(idxA), idxB: Number(idxB) });
    };

    const eliminarAlianzaBotin = (index) => {
      alianzasBotinRonda.value.splice(index, 1);
    };

    const guardarJugadorYContinuar = () => {
      guardarEnCelular();
      if (jugadorSeleccionadoIdx.value < jugadores.value.length - 1) {
        jugadorSeleccionadoIdx.value++;
      } else {
        procesarFinDeRonda();
      }
    };

    const procesarFinDeRonda = () => {
      procesarAlianzasBotin(alianzasBotinRonda.value, jugadores.value);

      jugadores.value.forEach(j => {
        const res = calcularPuntajeRonda(
          j.apuesta, 
          j.ganadas, 
          rondaActual.value, 
          j.eventosBono, 
          configuracionMesa.value.usarModoBribon, 
          j.modoEnvite
        );
        j.puntos += res.puntajeTotal;
        j.apuesta = 0;
        j.ganadas = 0;
        j.modoEnvite = 'metralla';
        j.apuestaBribon = 0;
        j.eventosBono = {};
      });

      alianzasBotinRonda.value = [];

      if (rondaActual.value < 10) {
        rondaActual.value++;
        jugadorSeleccionadoIdx.value = indiceJugadorInicial.value;
        guardarEnCelular();
      } else {
        if (configuracionMesa.value.usarComodinesBonificacion) {
          jugadores.value.forEach(j => {
            j.puntos += calcularBonoComodines(j.cartasBlancas);
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
        partidaFinalizada.value = true;
        mostrarPodio.value = true;
      }
    };

    const abrirPodioDesdePartida = () => {
      partidaFinalizada.value = false;
      mostrarPodio.value = true;
    };

    const cerrarPodio = () => {
      mostrarPodio.value = false;
      if (partidaFinalizada.value) {
        pantallaActual.value = 'inicio';
      }
    };

    const volverAlInicioDesdeMenu = () => {
      menuHamburguesaAbierto.value = false;
      pantallaActual.value = 'inicio';
    };

    const abrirConfiguracionMesa = () => {
      menuHamburguesaAbierto.value = false;
      pantallaActual.value = 'nueva_partida';
    };

    const descartarPartidaActual = () => {
      if (confirm('¿Estás seguro de que querés descartar y eliminar la partida actual?')) {
        localStorage.removeItem('skullking_guardado');
        hayPartidaGuardada.value = false;
        menuHamburguesaAbierto.value = false;
        pantallaActual.value = 'inicio';
      }
    };

    const guardarEnCelular = () => {
      localStorage.setItem('skullking_guardado', JSON.stringify({
        jugadores: jugadores.value,
        rondaActual: rondaActual.value,
        configuracionMesa: configuracionMesa.value,
        alianzasBotinRonda: alianzasBotinRonda.value
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
        if (parsed.configuracionMesa) configuracionMesa.value = parsed.configuracionMesa;
        if (parsed.alianzasBotinRonda) alianzasBotinRonda.value = parsed.alianzasBotinRonda;
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
      partidaFinalizada,
      menuHamburguesaAbierto,
      vistaWiki,
      acordeonAbierto,
      terminoBusquedaCarta,
      filtroTipoCarta,
      categoriasReglas,
      cantidadJugadores,
      nombresJugadores,
      configuracionMesa,
      rondaActual,
      jugadores,
      jugadorSeleccionadoIdx,
      jugadorActual,
      jugadorInicial,
      jugadorReparte,
      tablaGeneralOrdenada,
      historialPartidas,
      alianzasBotinRonda,
      catalogoEventosFiltrado,
      catalogoCartasFiltrado,
      limiteBazasAlcanzado,
      puntajeProyectadoActual,
      textoBotonAvanzar,
      toggleAcordeon,
      cambiarCantidadJugadores,
      cambiarModoContenido,
      moverJugador,
      irANuevaPartida,
      comenzarPartida,
      cambiarCantidadBono,
      obtenerCantidadBono,
      obtenerMaximoDisponible,
      borrarBonoInmediato,
      limpiarTodosLosEventos,
      esBotonBazaDeshabilitado,
      seleccionarBazasGanadas,
      calcularBonoBlancas: calcularBonoComodines,
      agregarAlianzaBotin,
      eliminarAlianzaBotin,
      guardarJugadorYContinuar,
      abrirPodioDesdePartida,
      cerrarPodio,
      volverAlInicioDesdeMenu,
      abrirConfiguracionMesa,
      descartarPartidaActual,
      eliminarPartidaHistorial,
      borrarTodoElHistorial
    };
  }
}).mount('#app');