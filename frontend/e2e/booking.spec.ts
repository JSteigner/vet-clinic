import { type Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { clinicDate, clinicTimeZone, createOwnerWithPet, createVet } from './helpers';

// Exact labels: the header search ("Search owners, pets and vets") contains these words too.
const field = (page: Page, label: 'Owner' | 'Pet' | 'Vet') =>
  page.getByLabel(label, { exact: true });

/** Clicks the header's Book appointment button, which every page has. */
const bookFromHeader = (page: Page) =>
  page.getByRole('banner').getByRole('link', { name: 'Book appointment' }).click();

test('books an appointment that then appears on that day of the schedule', async ({
  page,
  request,
}) => {
  const zone = await clinicTimeZone(request);
  const { owner, pet } = await createOwnerWithPet(request);
  const vet = await createVet(request);
  const day = clinicDate(zone, 2);

  await page.goto(`/?date=${day}`);
  await bookFromHeader(page);

  await field(page, 'Owner').selectOption({ label: owner.name });
  await field(page, 'Pet').selectOption({ label: pet.name });
  await field(page, 'Vet').selectOption({ label: vet.name });
  await page.getByLabel(/Date and time/).fill(`${day}T10:15`);
  await page.getByLabel('Reason').fill('E2E booking');
  await page.getByRole('button', { name: 'Book appointment' }).click();

  await expect(page).toHaveURL(`/?date=${day}`);
  const row = page.getByRole('listitem').filter({ hasText: pet.name });
  await expect(row).toContainText('10:15 AM');
  await expect(row).toContainText('E2E booking');
  await expect(row).toContainText('Scheduled');
});

test("books from a pet's page, with its owner and the pet filled in", async ({ page, request }) => {
  const { owner, pet } = await createOwnerWithPet(request);
  const vet = await createVet(request);

  await page.goto(`/pets/${pet.id}`);
  await bookFromHeader(page);

  await expect(page).toHaveURL(`/appointments/new?petId=${pet.id}`);
  await expect(field(page, 'Owner')).toHaveValue(owner.id);
  await expect(field(page, 'Pet')).toHaveValue(pet.id);
  await expect(page.getByLabel(/Date and time/)).not.toHaveValue('');

  // Book with the form's own time: the next quarter hour, so it's in the future.
  await field(page, 'Vet').selectOption({ label: vet.name });
  await page.getByLabel('Reason').fill('From the pet page');
  await page.getByRole('button', { name: 'Book appointment' }).click();

  await expect(page).toHaveURL(/\/\?date=\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByRole('listitem').filter({ hasText: pet.name })).toContainText(
    'From the pet page',
  );
});

test('fills in an owner, or a vet and the day shown, from their pages', async ({
  page,
  request,
}) => {
  const zone = await clinicTimeZone(request);
  const { owner } = await createOwnerWithPet(request);
  const vet = await createVet(request);
  const day = clinicDate(zone, 3);

  await page.goto(`/owners/${owner.id}`);
  await bookFromHeader(page);
  await expect(page).toHaveURL(`/appointments/new?ownerId=${owner.id}`);
  await expect(field(page, 'Owner')).toHaveValue(owner.id);
  await expect(field(page, 'Vet')).toHaveValue('');

  await page.goto(`/vets/${vet.id}?date=${day}`);
  await bookFromHeader(page);
  await expect(page).toHaveURL(`/appointments/new?vetId=${vet.id}&date=${day}`);
  await expect(field(page, 'Vet')).toHaveValue(vet.id);
  await expect(field(page, 'Owner')).toHaveValue('');
  await expect(page.getByLabel(/Date and time/)).toHaveValue(`${day}T09:00`);
});
