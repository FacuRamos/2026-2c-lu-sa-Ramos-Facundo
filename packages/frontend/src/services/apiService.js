import {
  eventsService,
  purchasesService,
  chatService,
  reviewsService,
  organizerService,
  authService,
  notificationsService,
  webApiCaller,
} from './api/index.js';

export * from './api/index.js';

class ApiService {
  constructor() {
    this.events = eventsService;
    this.purchases = purchasesService;
    this.chat = chatService;
    this.reviews = reviewsService;
    this.organizer = organizerService;
    this.auth = authService;
    this.notifications = notificationsService;
    this.client = webApiCaller;
  }

  reset() {
    eventsService.reset();
    purchasesService.reset();
    chatService.reset();
    reviewsService.reset();
    organizerService.reset();
    authService.reset();
    notificationsService.reset();
  }

  // --- CATEGORIAS & EVENTOS ---
  async getCategorias() {
    return eventsService.getCategorias();
  }

  async getEventos(params) {
    return eventsService.getEventos(params);
  }

  async getEventoById(id) {
    return eventsService.getEventoById(id);
  }

  async createEvento(data) {
    return eventsService.createEvento(data);
  }

  async getFavoritos(compradorId) {
    return eventsService.getFavoritos(compradorId);
  }

  async toggleFavorito(compradorId, eventoId) {
    return eventsService.toggleFavorito(compradorId, eventoId);
  }

  // --- COMPRAS ---
  async getComprasByComprador(compradorId) {
    return purchasesService.getComprasByComprador(compradorId);
  }

  async getCompraById(id) {
    return purchasesService.getCompraById(id);
  }

  async createCompra(data) {
    return purchasesService.createCompra(data);
  }

  async cancelarCompra(compraId, usuarioId) {
    return purchasesService.cancelarCompra(compraId, usuarioId);
  }

  // --- CHAT ---
  async getMensajesCompra(compraId) {
    return chatService.getMensajesCompra(compraId);
  }

  async enviarMensajeCompra(compraId, data) {
    return chatService.enviarMensajeCompra(compraId, data);
  }

  // --- RESEÑAS ---
  async getReseniasByEvento(eventoId) {
    return reviewsService.getReseniasByEvento(eventoId);
  }

  async getReseniasByOrganizador(organizadorId) {
    return reviewsService.getReseniasByOrganizador(organizadorId);
  }

  async crearResenia(data) {
    return reviewsService.crearResenia(data);
  }

  // --- ORGANIZADOR ---
  async getComprasByOrganizador(organizadorId) {
    return organizerService.getComprasByOrganizador(organizadorId);
  }

  async getStatsOrganizador(organizadorId) {
    return organizerService.getStatsOrganizador(organizadorId);
  }

  async getConversacionesOrganizador(organizadorId) {
    return organizerService.getConversacionesOrganizador(organizadorId);
  }

  // --- NOTIFICACIONES ---
  async getNotificaciones(params) {
    return notificationsService.getNotificaciones(params);
  }

  async marcarNotificacionLeida(id) {
    return notificationsService.marcarNotificacionLeida(id);
  }

  async marcarTodasNotificacionesLeidas(params) {
    return notificationsService.marcarTodasNotificacionesLeidas(params);
  }

  async getUnreadNotificacionesCount(params) {
    return notificationsService.getUnreadNotificacionesCount(params);
  }

  async crearNotificacion(data) {
    return notificationsService.crearNotificacion(data);
  }

  // --- AUTH ---
  async loginDemo(rol) {
    return authService.loginDemo(rol);
  }

  async login(creds) {
    return authService.login(creds);
  }

  async registerBuyer(data) {
    return authService.registerBuyer(data);
  }

  async registerOrganizer(data) {
    return authService.registerOrganizer(data);
  }
}

export const apiService = new ApiService();
