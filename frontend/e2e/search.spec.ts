import { expect, test } from './fixtures';
import { createOwnerWithPet, graphql, unique } from './helpers';

test('finds a pet by part of its name from the header and opens it', async ({ page, request }) => {
  const { pet } = await createOwnerWithPet(request);

  await page.goto('/');
  await page
    .getByRole('combobox', { name: 'Search owners, pets and vets' })
    .fill(pet.name.slice(4));

  const pets = page.getByRole('group', { name: 'Pets' });
  await pets.getByRole('option', { name: new RegExp(`^${pet.name}`) }).click();

  await expect(page).toHaveURL(`/pets/${pet.id}`);
  await expect(page.getByRole('heading', { name: pet.name })).toBeVisible();
});

test('finds an owner by phone digits on the results page', async ({ page, request }) => {
  const id = unique();
  const { createOwner: owner } = await graphql<{ createOwner: { id: string; name: string } }>(
    request,
    'mutation ($input: CreateOwnerInput!) { createOwner(input: $input) { id name } }',
    { input: { name: `E2E Owner ${id}`, email: `e2e-${id}@example.com`, phone: '(555) 010-4242' } },
  );

  await page.goto('/search');
  const form = page.getByRole('search', { name: 'Search' });
  await form.getByLabel('Search owners, pets and vets').fill('5550104242');
  await form.getByRole('button', { name: 'Search' }).click();

  await expect(page).toHaveURL('/search?q=5550104242');
  await page.getByRole('list', { name: 'Owners' }).getByRole('link', { name: owner.name }).click();

  await expect(page).toHaveURL(`/owners/${owner.id}`);
});

test('finds an archived owner and restores them with their pets', async ({ page, request }) => {
  const { owner, pet } = await createOwnerWithPet(request);
  await graphql(request, 'mutation ($id: ID!) { deleteOwner(id: $id) { id } }', { id: owner.id });

  await page.goto('/');
  const box = page.getByRole('combobox', { name: 'Search owners, pets and vets' });
  const results = page.getByRole('listbox', { name: 'Search results' });

  // The "archived" keyword lists archived records only.
  await box.fill('archived owners');
  await expect(results.getByRole('option', { name: new RegExp(`^${owner.name}`) })).toContainText(
    'Archived',
  );

  // Without it, the owner is found only with "Include archived" checked. Search
  // by the name's unique part: "Owner" in it would read as the owners keyword.
  await box.fill(owner.name.split(' ').at(-1)!);
  await expect(results).toContainText('No matches.');
  await page.getByRole('checkbox', { name: 'Include archived' }).check();
  await results.getByRole('option', { name: new RegExp(`^${owner.name}`) }).click();

  await expect(page).toHaveURL(`/owners/${owner.id}`);
  await expect(page.getByText(/^Archived on /)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Restore' }).click();

  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  await expect(page.getByText(/^Archived on /)).toHaveCount(0);
  const pets = page.getByRole('list', { name: 'Pets' });
  await expect(pets.getByRole('listitem')).toHaveText(`${pet.name} Dog`);
});
