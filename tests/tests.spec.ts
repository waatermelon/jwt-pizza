  import { basicInit } from '../tests/test_help/test_init';
  import { test, expect } from 'playwright-test-coverage';

  test('should load homepage', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle('JWT Pizza');
  });

  test('should navigate footer links', async ({ page }) => {
    await basicInit(page)
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toContainText('The secret sauce');
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
  });

  test('should login successfully', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByLabel('Email address').fill('d@jwt.com');
    await page.getByLabel('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('link', { name: 'DD' })).toBeVisible();
  });

  test('should register new diner and logout', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.getByRole('heading')).toContainText('Welcome to the party');
    await page.getByPlaceholder('Full name').fill('Diner Dude')
    await page.getByLabel('Email address').fill('d@jwt.com');
    await page.getByLabel('Password').fill('a');

    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
  });

  test('should complete purchase after login', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('button', { name: 'Order now' }).click();
    await expect(page.locator('h2')).toContainText('Awesome is a click away');

    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: /Veggie A/ }).click();

    await expect(page.locator('form')).toContainText('Selected pizzas: 1');
    await page.getByRole('button', { name: 'Checkout' }).click();

    // Login and pay
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tfoot')).toContainText('0.004 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();
  });

  test('should load diner dashboard', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'DD' }).click()
    await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
  });

  test('should manage franchise dashboard', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('f@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

    await page.getByRole('button', { name: 'Create store' }).click();
    await expect(page.getByRole('heading')).toContainText('Create store');
    await page.getByRole('textbox', { name: 'store name' }).fill('dummy');
    await page.getByRole('button', { name: 'Create' }).click();
  });

  test('should manage admin dashboard', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('a@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.locator('h2')).toContainText("Mama Ricci's kitchen");

    await page.getByRole('textbox', { name: 'Filter franchises' }).fill('Ligma');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await expect(page.getByRole('heading')).toContainText('Create franchise');
    await page.getByRole('textbox', { name: 'franchise name' }).fill('sigmaFranchise');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();

    await page.getByRole('link', { name: 'admin-dashboard' }).click();
    await page.getByRole('row', { name: /Spanish Fork.*Close/ }).getByRole('button').click()
    await expect(page.getByRole('heading')).toContainText('Sorry to see you go')
  });
