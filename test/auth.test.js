const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('authentication and protected routes', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  async function request(path, options = {}) {
    const response = await fetch(base + path, { ...options, redirect: 'manual', headers: { Cookie: cookie, ...options.headers } });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) cookie = cookies.map(c => c.split(';')[0]).join('; ');
    return response;
  }
  const login = (username, password) => request('/login', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }).toString()
  });
  try {
    assert.match(await (await request('/')).text(), /Welcome! Please/);
    assert.equal((await request('/home')).headers.get('location'), '/login');
    assert.equal((await request('/login')).status, 200);
    for (const credentials of [['westcliff', 'bad'], ['unknown', 'secret'], ['', '']]) {
      assert.equal((await login(...credentials)).headers.get('location'), '/login?error=1');
      assert.equal((await request('/home')).headers.get('location'), '/login');
    }
    assert.match(await (await request('/login?error=1')).text(), /Invalid username or password/);
    for (const [username, password, displayName] of [['westcliff', 'secret', 'WestCliff'], ['westcliffclass', 'birthday', 'WestCliffUniversity']]) {
      assert.equal((await login(username, password)).headers.get('location'), '/');
      assert.match(await (await request('/')).text(), new RegExp(`Welcome, ${displayName}!`));
      assert.equal((await request('/home')).status, 200);
      const oldCookie = cookie;
      assert.equal((await request('/logout')).headers.get('location'), '/');
      assert.match(await (await request('/')).text(), /Welcome! Please/);
      assert.equal((await request('/home')).headers.get('location'), '/login');
      cookie = oldCookie;
      assert.equal((await request('/home')).headers.get('location'), '/login');
      cookie = '';
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
