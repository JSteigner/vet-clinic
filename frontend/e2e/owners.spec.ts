import { expect, test } from '@playwright/test';

import { unique } from './helpers';

test('adds an owner and a pet, then archives the owner', async ({ page }) => {
  const id = unique();
  const ownerName = `E2E Owner ${id}`;
  const petName = `Pet ${id}`;

  await page.goto('/owners');
  await page.getByRole('button', { name: 'Add owner' }).click();
  const ownerForm = page.getByRole('form', { name: 'New owner' });
  await ownerForm.getByLabel('Name').fill(ownerName);
  await ownerForm.getByLabel('Email').fill(`e2e-${id}@example.com`);
  await ownerForm.getByRole('button', { name: 'Add owner' }).click();

  await expect(page.getByRole('heading', { name: ownerName })).toBeVisible();

  await page.getByRole('button', { name: 'Add pet' }).click();
  const petForm = page.getByRole('form', { name: 'New pet' });
  await petForm.getByLabel('Name').fill(petName);
  await petForm.getByLabel('Species').selectOption({ label: 'Rabbit' });
  await petForm.getByRole('button', { name: 'Add pet' }).click();

  const pets = page.getByRole('list', { name: 'Pets' });
  await expect(pets.getByRole('link', { name: petName })).toBeVisible();
  await expect(pets).toContainText('Rabbit');

  await page.getByRole('button', { name: 'Archive owner' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();

  await expect(page).toHaveURL('/owners');
  await expect(page.getByRole('link', { name: ownerName })).toHaveCount(0);
});
