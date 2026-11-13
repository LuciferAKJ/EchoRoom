import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../components/ui/Input';

describe('UI: Input Component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="Pseudonym" placeholder="Enter anonymous handle" />);
    expect(screen.getByLabelText(/pseudonym/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter anonymous handle/i)).toBeInTheDocument();
  });

  it('updates value when user types', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type here" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/type here/i);
    fireEvent.change(input, { target: { value: 'Mystic Echo' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is passed', () => {
    render(<Input placeholder="Password" error="Password must be at least 6 characters" />);
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });
});
