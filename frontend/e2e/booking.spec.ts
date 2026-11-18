import { expect, test } from './fixtures';
import { clinicDate, clinicTimeZone, createOwnerWithPet, createVet } from './helpers';

test('books an appointment that then appears on that day of the schedule', async ({
  page,
  request,
}) => {
  const zone = await clinicTimeZone(request);
  const { owner, pet } = await createOwnerWithPet(request);
  const vet = await createVet(request);
  const day = clinicDate(zone, 2);

  await page.goto(`/?date=${day}`);
  await page.getByRole('link', { name: 'Book appointment' }).click();

  // Exact labels: the header search ("Search owners, pets and vets") contains these words too.
  await page.getByLabel('Owner', { exact: true }).selectOption({ label: owner.name });
  await page.getByLabel('Pet', { exact: true }).selectOption({ label: pet.name });
  await page.getByLabel('Vet', { exact: true }).selectOption({ label: vet.name });
  await page.getByLabel(/Date and time/).fill(`${day}T10:15`);
  await page.getByLabel('Reason').fill('E2E booking');
  await page.getByRole('button', { name: 'Book appointment' }).click();

  await expect(page).toHaveURL(`/?date=${day}`);
  const row = page.getByRole('listitem').filter({ hasText: pet.name });
  await expect(row).toContainText('10:15 AM');
  await expect(row).toContainText('E2E booking');
  await expect(row).toContainText('Scheduled');
});
