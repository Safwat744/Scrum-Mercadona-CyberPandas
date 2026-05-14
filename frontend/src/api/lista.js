import client from './client';

export const getLista     = (agrupada = false) => client.get('/lista', { params: { agrupada } }).then(r => r.data);
export const addReceta    = (receta_id, raciones) => client.post('/lista/items', { receta_id, raciones }).then(r => r.data);
export const toggleCogido = (id)  => client.patch(`/lista/items/${id}`).then(r => r.data);
export const deleteItem   = (id)  => client.delete(`/lista/items/${id}`).then(r => r.data);
export const vaciarLista  = ()    => client.delete('/lista').then(r => r.data);
