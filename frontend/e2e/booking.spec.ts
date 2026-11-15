import { expect, test } from '@playwright/test';

import { anyVet, archiveOwner, clinicDate, clinicTimeZone, createOwnerWithPet } from './helpers';

test('books an appointment that then appears on that day of the schedule', async ({
  page,
  request,
}) => {
  const zone = await clinicTimeZone(request);
  const { owner, pet } = await createOwnerWithPet(request);
  const vet = await anyVet(request);
  const day = clinicDate(zone, 2);

  try {
    await page.goto(`/?date=${day}`);
    await page.getByRole('link', { name: 'Book appointment' }).click();

    await page.getByLabel('Owner').selectOption({ label: owner.name });
    await page.getByLabel('Pet').selectOption({ label: pet.name });
    await page.getByLabel('Vet').selectOption({ label: vet.name });
    await page.getByLabel(/Date and time/).fill(`${day}T10:15`);
    await page.getByLabel('Reason').fill('E2E booking');
    await page.getByRole('button', { name: 'Book appointment' }).click();

    await expect(page).toHaveURL(`/?date=${day}`);
    const row = page.getByRole('listitem').filter({ hasText: pet.name });
    await expect(row).toContainText('10:15 AM');
    await expect(row).toContainText('E2E booking');
    await expect(row).toContainText('Scheduled');
  } finally {
    await archiveOwner(request, owner.id);
  }
});
