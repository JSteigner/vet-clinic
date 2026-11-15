import { expect, test } from '@playwright/test';

import {
  anyVet,
  archiveOwner,
  clinicDate,
  clinicTime,
  clinicTimeZone,
  createAppointment,
  createOwnerWithPet,
} from './helpers';

test('refuses to delete a vet who still has appointments, and says why', async ({
  page,
  request,
}) => {
  const zone = await clinicTimeZone(request);
  const { owner, pet } = await createOwnerWithPet(request);
  const vet = await anyVet(request);
  // Make sure this vet has an appointment, whatever the seed data holds.
  await createAppointment(request, {
    petId: pet.id,
    vetId: vet.id,
    startsAt: clinicTime(zone, clinicDate(zone, 4), '15:00'),
    reason: 'E2E vet delete',
  });

  try {
    await page.goto(`/vets/${vet.id}`);
    await page.getByRole('button', { name: 'Delete vet' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      "Couldn't delete the vet: appointments still exist for this vet",
    );
    await expect(page).toHaveURL(`/vets/${vet.id}`);
    await expect(page.getByRole('heading', { name: vet.name })).toBeVisible();
  } finally {
    await archiveOwner(request, owner.id);
  }
});
