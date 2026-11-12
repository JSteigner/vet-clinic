import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import ConfirmButton from './ConfirmButton';

describe('ConfirmButton', () => {
  test('confirms on Yes', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmButton label="Delete" question="Delete this?" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  test('backs out on No without confirming', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmButton label="Delete" question="Delete this?" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete this?')).not.toBeInTheDocument();
  });
});
