import { basicInit } from '../tests/test_help/test_init';
import { test, expect } from 'playwright-test-coverage';

test("should update user", async ({ page }) => {
    await basicInit(page);


});

test("should list users", async ({ page }) => {
    await basicInit(page);


});

test("should delete user", async ({ page }) => {
    await basicInit(page);

    
});