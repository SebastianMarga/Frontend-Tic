import apiFetch from "../interceptors/api.js"

export const userService = {

  async getUsers() {
    const data = await apiFetch.get('/user/users');
    return data;
  },

  async createUser(user) {
    const data = await apiFetch.post('/user/users', user);
    return data;
  },

  async updateUser(user, id) {
    const data = await apiFetch.patch(`/user/users/${id}`, user);
    return data;
  },

  async removeUser(id) {
    await apiFetch.delete(`/user/users/${id}`);
  }
}