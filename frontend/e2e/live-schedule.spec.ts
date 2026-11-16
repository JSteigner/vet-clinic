import { expect, test } from './fixtures';
import {
  clinicDate,
  clinicTime,
  clinicTimeZone,
  createAppointment,
  createOwnerWithPet,
  createVet,
  trackSubscriptions,
} from './helpers';

test('a check-in at one desk shows up live on another desk', async ({
  browser,
  request,
  sandbox,
}) => {
  const zone = await clinicTimeZone(request);
  const { pet } = await createOwnerWithPet(request);
  const vet = await createVet(request);
  const day = clinicDate(zone, 3);
  await createAppointment(request, {
    petId: pet.id,
    vetId: vet.id,
    startsAt: clinicTime(zone, day, '11:00'),
    reason: 'E2E live update',
  });

  // Two separate browser contexts: no shared cache, cookies or storage, like two
  // computers at the clinic. Only the subscription connects them. Both use the
  // test's sandbox, so they see the same (rolled-back) data.
  const frontDesk = await browser.newContext({ userAgent: sandbox });
  const backOffice = await browser.newContext({ userAgent: sandbox });

  try {
    const front = await frontDesk.newPage();
    const back = await backOffice.newPage();
    const backSubscribed = trackSubscriptions(back);

    await Promise.all([front.goto(`/?date=${day}`), back.goto(`/?date=${day}`)]);
    const backRow = back.getByRole('listitem').filter({ hasText: pet.name });
    await expect(backRow).toContainText('Scheduled');
    await backSubscribed();

    await front
      .getByRole('listitem')
      .filter({ hasText: pet.name })
      .getByRole('button', { name: 'Check in' })
      .click();

    // No reload on the back office page: the change arrives over the socket.
    await expect(backRow).toContainText('Checked in');
    await expect(backRow.getByRole('button', { name: 'Complete' })).toBeVisible();
  } finally {
    await frontDesk.close();
    await backOffice.close();
  }
});
