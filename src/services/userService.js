import apiFetch from "../interceptors/api.js"

export const userService = {

  async getUsers() {
    const data = await apiFetch.get('/user/users');
    return data;
  }

}