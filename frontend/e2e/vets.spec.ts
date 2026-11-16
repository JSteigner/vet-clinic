import { expect, test } from './fixtures';
import {
  clinicDate,
  clinicTime,
  clinicTimeZone,
  createAppointment,
  createOwnerWithPet,
  createVet,
} from './helpers';

test('refuses to delete a vet who still has appointments, and says why', async ({
  page,
  request,
}) => {
  const zone = await clinicTimeZone(request);
  const { pet } = await createOwnerWithPet(request);
  const vet = await createVet(request);
  await createAppointment(request, {
    petId: pet.id,
    vetId: vet.id,
    startsAt: clinicTime(zone, clinicDate(zone, 4), '15:00'),
    reason: 'E2E vet delete',
  });

  await page.goto(`/vets/${vet.id}`);
  await page.getByRole('button', { name: 'Delete vet' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    "Couldn't delete the vet: appointments still exist for this vet",
  );
  await expect(page).toHaveURL(`/vets/${vet.id}`);
  await expect(page.getByRole('heading', { name: vet.name })).toBeVisible();
});
