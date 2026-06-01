import client from './client';

export const getLista     = (agrupada = false) => client.get('/lista', { params: { agrupada } }).then(r => r.data);
export const addReceta    = (receta_id, raciones) => client.post('/lista/items', { receta_id, raciones }).then(r => r.data);
export const toggleCogido = (id)  => client.patch(`/lista/items/${id}`).then(r => r.data);
export const updatePaquetes = (id, paquetes) => client.patch(`/lista/items/${id}/cantidad`, { paquetes }).then(r => r.data);
export const getAlternativas = (productoId) => client.get('/lista/alternativas', { params: { producto_id: productoId } }).then(r => r.data);
export const swapProducto = (id, nuevoProductoId) => client.patch(`/lista/items/${id}/swap`, { nuevo_producto_id: nuevoProductoId }).then(r => r.data);
export const searchProductosLibres = (q) => client.get('/lista/productos', { params: { q } }).then(r => r.data);
export const addManualProduct = (productoId) => client.post('/lista/manual', { producto_id: productoId }).then(r => r.data);
export const deleteItem   = (id)  => client.delete(`/lista/items/${id}`).then(r => r.data);
export const vaciarLista  = ()    => client.delete('/lista').then(r => r.data);
