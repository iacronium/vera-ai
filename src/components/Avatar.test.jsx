import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders an <img> element when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" name="Jane Doe" />);
    const img = screen.getByRole('img');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Jane Doe');
  });

  it('shows initials fallback when image onError fires', () => {
    render(<Avatar src="https://example.com/broken.jpg" name="Jane Doe" />);
    const img = screen.getByRole('img');
    // Initially renders the image
    expect(img.tagName).toBe('IMG');

    // Simulate image load failure
    fireEvent.error(img);

    // Should now show the initials fallback div
    const fallback = screen.getByRole('img');
    expect(fallback.tagName).toBe('DIV');
    expect(fallback).toHaveTextContent('JD');
  });

  it('renders without crashing when name is an empty string', () => {
    render(<Avatar name="" />);
    const fallback = screen.getByRole('img');
    expect(fallback).toBeInTheDocument();
    // Should show '?' as the fallback initials for empty name
    expect(fallback).toHaveTextContent('?');
  });
});
