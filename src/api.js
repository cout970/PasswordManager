/**
 * Store settings on a remote service
 * @see https://github.com/cout970/PublicStorage
 * @param settings
 * @param data
 * @returns {Promise<string|*>}
 */
export async function externalStoreSettings(settings, data) {
  let token;

  try {
    // Try to log-in
    token = await login(settings.externalServiceHost, settings.externalServiceAccount, settings.externalServicePassword);
  } catch (error) {
    // Create account if not exists
    if (error.status && error.status === 404 && settings.externalServiceRegister) {
      token = await register(settings.externalServiceHost, settings.externalServiceAccount, settings.externalServicePassword);
    } else {
      // No login, no register, invalid account/pass combination or backend error
      throw error;
    }
  }

  // Just create a new paste
  if (!settings.externalServiceUpdate) {
    return await createPaste(settings.externalServiceHost, token, data);
  }

  // Update paste
  let matches = settings.externalServiceUrl.match(/.*\/api\/v1\/paste\/(\d+)$/);

  if (matches) {
    try {
      return await updatePaste(settings.externalServiceHost, token, matches[1], data);
    } catch (e) {
      // ignore, just create a new paste
      console.error(e);
    }
  }

  // Update failed or url is not defined
  return await createPaste(settings.externalServiceHost, token, data);
}

/**
 * Create a new paste
 * @param host
 * @param token
 * @param data
 * @returns {Promise<string>}
 */
async function createPaste(host, token, data) {
  let resp = await fetch(host + '/api/v1/paste', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      contents: data,
    }),
  });

  if (!resp.ok) throw new Error('Backend error: ' + resp.status + ' ' + resp.statusText);

  let pastePath = resp.headers.get('location');
  return host + pastePath;
}

/**
 * Update an existing paste
 * @param host
 * @param token
 * @param id
 * @param data
 * @returns {Promise<string>}
 */
async function updatePaste(host, token, id, data) {
  let url = host + '/api/v1/paste/' + id;
  let resp = await fetch(url, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      contents: data,
    }),
  });

  if (!resp.ok) throw new Error('Backend error: ' + resp.status + ' ' + resp.statusText);
  return url;
}

/**
 * Get session token for an account
 * @param host
 * @param name
 * @param password
 * @returns {Promise<*>}
 */
async function login(host, name, password) {
  let resp = await fetch(host + '/api/v1/account/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({name, password}),
  });

  if (!resp.ok) {
    let error = new Error('Backend error: ' + resp.status + ' ' + resp.statusText);
    error.response = resp;
    error.status = resp.status;
    throw error;
  }

  let json = await resp.json();
  return json.token;
}

/**
 * Create a new account
 * @param host
 * @param name
 * @param password
 * @returns {Promise<*>}
 */
async function register(host, name, password) {
  let resp = await fetch(host + '/api/v1/account', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({name, password}),
  });

  if (!resp.ok) throw new Error('Backend error: ' + resp.status + ' ' + resp.statusText);

  let json = await resp.json();
  return json.token;
}

/**
 * Get the contents of a paste
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function retrievePaste(url) {
  let resp = await fetch(url, {
    headers: {Accept: 'text/plain'},
  });

  if (!resp.ok) throw new Error('Backend error: ' + resp.status + ' ' + resp.statusText);

  return await resp.text();
}