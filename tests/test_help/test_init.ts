import { Page } from '@playwright/test';
import { Role, User } from '../../src/service/pizzaService';

export async function basicInit(page: Page) {
  let users: Record<string, User> = {
    'd@jwt.com': {
      id: '3',
      name: 'Diner Dude',
      email: 'd@jwt.com',
      password: 'a',
      roles: [{ role: Role.Diner }],
    },
    'f@jwt.com': {
      id: '5',
      name: 'FranchiseDude',
      email: 'f@jwt.com',
      password: 'a',
      roles: [{ role: Role.Franchisee }],
    },
    'a@jwt.com': {
      id: '7',
      name: 'AdminDude',
      email: 'a@jwt.com',
      password: 'a',
      roles: [{ role: Role.Admin }],
    },
  };

  let currUser: User;
  await page.route('**/api/auth', async (route) => {
    switch(route.request().method()) {
      case "POST": {
        const registerReq = route.request().postDataJSON();
        currUser = users[registerReq.email];
        const registerRes = {
          user: currUser,
          token: 'token lol',
        };
        await route.fulfill({ json: registerRes });
        break;
      }
      case "PUT": {
        const loginReq = route.request().postDataJSON();
        const user = users[loginReq.email];
        if (!user || user.password !== loginReq.password) {
          await route.fulfill({ status: 400, json: { error: 'Suck it' } });
          return;
        }
        currUser = users[loginReq.email];
        const loginRes = {
          user: currUser,
          token: 'token lol',
        };
        await route.fulfill({ json: loginRes });
        break;
      }
      case "DELETE": {
        await route.fulfill({ json: {message: 'logout successful'}});
        break;
      }
    }
  });

  await page.route(/\/api\/\d+\/store\/(\d+)?$/, async (route) => {
    switch(route.request().method()) {
      case "POST": {
        const storeReq = route.request().postDataJSON();
        const storeRes = {
          id: 1,
          name: storeReq.name,
          totalRevenue: 0,
        };
        await route.fulfill({ json: storeRes });
        break;
      }

      case "DELETE": {
        const franchiseRes = {
          message: "store deleted",
        };
        await route.fulfill({ json: franchiseRes });
        break;
      }
    }
  });

  await page.route('**/api/user/me', async (route) => {
    route.request().method();
    await route.fulfill({ json: currUser });
  });

  await page.route('**/api/order/menu', async (route) => {
    if (route.request().method() === 'GET') {
      let menuRes = [{
          id: 1,
          title: 'Veggie',
          image: 'pizza1.png',
          price: 0.0038,
          description: 'A garden of delight',
        }
      ];

      await route.fulfill({ json: menuRes });
    }
  });

  await page.route('**/api/order', async (route) => {
    switch(route.request().method()) {
      case "POST": {
        const orderRes = {
          order: { ...route.request().postDataJSON(), id: 23 },
          jwt: 'eyJpYXQ',
        };
        await route.fulfill({ json: orderRes });
        break;
      }

      case "GET": {
        const orderRes = {
          dinerId: 1,
          orders: [{
              id: 1,
              franchiseId: 1,
              storeId: 1,
              date: "2025-07-05T05:17:20.000Z",
              items: [{
                  id: 1,
                  menuId: 1,
                  description: "Veggie",
                  price: 0.05,
                },
              ],
            },
          ],
          page: 1,
        };

        await route.fulfill({ json: orderRes });
        break;
      }
    }
  });

  await page.route(/\/api\/franchise\?.*$/, async (route) => {
    switch(route.request().method()) {
      case "GET": {
        const franchiseRes = {
          franchises: [{
              id: 2,
              name: 'LigmaPizza',
              stores: [
                { id: 4, name: 'Lehi' },
                { id: 5, name: 'Springville' },
                { id: 6, name: 'American Fork' },
              ],
            },
            { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
            { id: 4, name: 'topSpot', stores: [] },
          ],
        };
        await route.fulfill({ json: franchiseRes });
        break;
      }

      case "POST": {
        const franchiseReq = route.request().postDataJSON();
        const franchiseRes = {
          name: franchiseReq.name,
          admins: [{
            email: franchiseReq.admins.email,
            id: 2,
            name: "pizza franchisee",
          }],
          id: 1,
        };
        break;
      }
    }
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    switch (route.request().method()) {
      case "GET": {
        await route.fulfill({ json: [{
          id: "2",
          name: 'LigmaPizza',
          admins: [{ id: "5", name: "Frank", email: "f@jwt.com", }],
          stores: [{ id: "7", name: 'Spanish Fork', totalRevenue: 0, }],
        }]});
        break;
      }

      case "DELETE": {
        await route.fulfill({ json: { message: "franchise deleted" }});
        break;
      }
    }
  });

  await page.route('**/api/user?**', async (route) => {
    const url = new URL(route.request().url());
    const pageNum = Number(url.searchParams.get('page') || '0');
    const limit = Number(url.searchParams.get('limit') || '10');
    const nameFilter = url.searchParams.get('name') || '*';

    // simple filter and pagination
    let filteredUsers = Object.values(users).filter(u =>
      nameFilter === '*' || u.name?.toLowerCase().includes(nameFilter.replace(/\*/g, '').toLowerCase())
    );

    const start = pageNum * limit;
    const pagedUsers = filteredUsers.slice(start, start + limit);
    const more = start + limit < filteredUsers.length;

    await route.fulfill({ json: { users: pagedUsers, more } });
  });

  // DELETE /api/user/:userId
  await page.route(/\/api\/user\/\d+$/, async (route) => {
    const userId = route.request().url().split('/').pop()!;
    // allow only self or admin
    if (currUser.id !== userId && !currUser.roles?.some(r => r.role === Role.Admin)) {
      await route.fulfill({ status: 403, json: { message: 'unauthorized' } });
      return;
    }

    // delete user from in-memory DB
    for (const key in users) {
      if (users[key].id === userId) {
        delete users[key];
        break;
      }
    }

    await route.fulfill({ status: 204, body: '' }); // no content
  });

  await page.goto('/');
}