import { type APIRequestContext } from '@playwright/test';

import { expect, test } from './fixtures';
import {
  clinicDate,
  clinicTime,
  clinicTimeZone,
  createAppointment,
  createOwnerWithPet,
  createVet,
  graphql,
  unique,
} from './helpers';

/** Adds a second pet to an owner. */
const createPet = async (request: APIRequestContext, ownerId: string) => {
  const { createPet: pet } = await graphql<{ createPet: { id: string; name: string } }>(
    request,
    'mutation ($input: CreatePetInput!) { createPet(input: $input) { id name } }',
    { input: { ownerId, name: `Second ${unique()}`, species: 'CAT' } },
  );

  return pet;
};

/** Marks a visit completed: the API books only future times, so history is made this way. */
const complete = (request: APIRequestContext, id: string) =>
  graphql(
    request,
    'mutation ($id: ID!) { updateAppointmentStatus(id: $id, status: COMPLETED) { id } }',
    { id },
  );

/**
 * An owner with two pets, each with a visit: Rex (the first pet) with the
 * first vet tomorrow, still scheduled, and the second pet with the second vet
 * in two days, completed.
 */
const setUp = async (request: APIRequestContext) => {
  const zone = await clinicTimeZone(request);
  const { owner, pet } = await createOwnerWithPet(request);
  const second = await createPet(request, owner.id);
  const [vet, otherVet] = [await createVet(request), await createVet(request)];

  const upcomingId = await createAppointment(request, {
    petId: pet.id,
    vetId: vet.id,
    startsAt: clinicTime(zone, clinicDate(zone, 1), '10:00'),
    reason: 'Vaccines',
  });
  const completedId = await createAppointment(request, {
    petId: second.id,
    vetId: otherVet.id,
    startsAt: clinicTime(zone, clinicDate(zone, 2), '09:00'),
    reason: 'Checkup',
  });
  await complete(request, completedId);

  return { owner, pet, second, vet, otherVet, upcomingId };
};

test("lists all of an owner's pets' visits, upcoming by default", async ({ page, request }) => {
  const { owner, pet, second, vet, otherVet, upcomingId } = await setUp(request);

  await page.goto(`/owners/${owner.id}`);
  const visits = page.getByRole('list', { name: 'Visits' });
  await expect(page.getByLabel('Show')).toHaveValue('SCHEDULED');
  await expect(visits.getByRole('listitem')).toHaveCount(1);
  await expect(visits).toContainText(`${pet.name} with ${vet.name} · Vaccines`);

  await page.getByLabel('Show').selectOption({ label: 'All visits' });
  await expect(visits.getByRole('listitem')).toHaveCount(2);
  await expect(visits.getByRole('listitem').nth(1)).toContainText(
    `${second.name} with ${otherVet.name} · Checkup`,
  );
  await expect(visits.getByRole('listitem').nth(1)).toContainText('Completed');

  await visits.getByRole('listitem').first().getByRole('link').click();
  await expect(page).toHaveURL(`/appointments/${upcomingId}`);
});

test("lists all of a vet's visits on any day, filtered by status", async ({ page, request }) => {
  const { owner, pet, second, otherVet } = await setUp(request);

  // The second vet's only visit is completed, so "Upcoming" has none.
  await page.goto(`/vets/${otherVet.id}`);
  const visits = page.getByRole('list', { name: 'Visits' });
  await expect(page.getByText('No visits.')).toBeVisible();

  await page.getByLabel('Show').selectOption({ label: 'Completed' });
  await expect(visits.getByRole('listitem')).toHaveCount(1);
  await expect(visits).toContainText(`${second.name} (${owner.name}) · Checkup`);
  await expect(visits).not.toContainText(pet.name);
});
