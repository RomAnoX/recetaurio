import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";

class Auth {
  constructor() {
    this.client = null;
  }

  get config() {
    return {
      domain: "ulisesxsoft.auth0.com",
      client_id: "YJsK8QO0Em4d2jRz2x7PGUIJoJG06X70",
      redirect_uri: "http://localhost:8080/callback",
      cacheLocation: "localstorage",
      ui_locales: "es en",
      audience: "https://us-central1-recetaurio.cloudfunctions.net/api",
    };
  }

  async connect() {
    if (this.client) return;
    this.client = new Auth0Client(this.config);
    return this;
  }

  async checkAuthentication() {
    this.client = await createAuth0Client(this.config);
    return this;
  }

  async isAuthenticated() {
    if (!this.client) return false;
    return await this.client.isAuthenticated();
  }

  async login() {
    if (!this.client) return;
    await this.client.loginWithRedirect({
      redirect_uri: "http://localhost:8080/callback",
    });
  }

  async handleCallback() {
    if (!this.client) return null;
    return await this.client.handleRedirectCallback();
  }

  async getToken() {
    if (!this.client) return null;
    return await this.client.getTokenSilently();
  }

  async getUser() {
    if (!this.client) return null;
    return await this.client.getUser();
  }

  async logout() {
    if (!this.client) return;
    await this.client.logout({
      returnTo: "http://localhost:8080",
      ui_locales: "es en",
    });
  }
}

export default new Auth();
