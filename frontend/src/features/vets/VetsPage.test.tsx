import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders } from '../../test/render';
import { CREATE_VET, VETS } from './queries';
import VetsPage from './VetsPage';

const vet = (id: string, name: string, email: string) => ({ __typename: 'Vet', id, name, email });

const vetsQuery = (vets: object[]): MockLink.MockedResponse => ({
  request: { query: VETS },
  result: { data: { vets } },
});

const createVet = (result: MockLink.MockedResponse['result']): MockLink.MockedResponse => ({
  request: {
    query: CREATE_VET,
    variables: { input: { name: 'Dr. Lee', email: 'lee@example.com' } },
  },
  result,
});

const renderPage = (mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/vets" element={<VetsPage />} />
        <Route path="/vets/:id" element={<p>Vet page</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route: '/vets' },
  );

const fillInNewVet = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Add vet' }));
  const form = within(screen.getByRole('form', { name: 'New vet' }));
  await user.type(form.getByLabelText('Name'), 'Dr. Lee');
  await user.type(form.getByLabelText('Email'), 'lee@example.com');
  await user.click(form.getByRole('button', { name: 'Add vet' }));
};

describe('VetsPage', () => {
  test('lists vets by name with links to their pages', async () => {
    renderPage([
      vetsQuery([
        vet('31', 'Dr. Kim', 'kim@example.com'),
        vet('30', 'Dr. Alvarez', 'alvarez@example.com'),
      ]),
    ]);

    const links = within(await screen.findByRole('list', { name: 'Vets' })).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Dr. Alvarez', 'Dr. Kim']);
    expect(links[0]).toHaveAttribute('href', '/vets/30');
    expect(screen.getByText('kim@example.com')).toBeInTheDocument();
  });

  test('adds a vet and opens their page', async () => {
    const user = userEvent.setup();
    renderPage([
      vetsQuery([]),
      createVet({ data: { createVet: vet('32', 'Dr. Lee', 'lee@example.com') } }),
    ]);

    await fillInNewVet(user);

    expect(await screen.findByText('Vet page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/vets/32');
  });

  test("shows the API's field errors in the form", async () => {
    const user = userEvent.setup();
    renderPage([
      vetsQuery([]),
      createVet({
        errors: [{ message: 'email has already been taken', extensions: { field: 'email' } }],
      }),
    ]);

    await fillInNewVet(user);

    expect(await screen.findByText('has already been taken')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('cancels adding a vet', async () => {
    const user = userEvent.setup();
    renderPage([vetsQuery([])]);

    await user.click(await screen.findByRole('button', { name: 'Add vet' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('form', { name: 'New vet' })).not.toBeInTheDocument();
  });

  test('shows errors that belong to no field above the form fields', async () => {
    const user = userEvent.setup();
    renderPage([vetsQuery([]), createVet({ errors: [{ message: 'Something broke' }] })]);

    await fillInNewVet(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't save the vet: Something broke",
    );
  });

  test('shows an empty state and load errors', async () => {
    const { unmount } = renderPage([vetsQuery([])]);
    expect(await screen.findByText('No vets yet.')).toBeInTheDocument();
    unmount();

    renderPage([{ request: { query: VETS }, error: new Error('Network down') }]);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load the vets: Network down",
    );
  });
});
