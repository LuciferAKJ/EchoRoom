import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

describe('UI: Card Component', () => {
  it('renders card with title and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Midnight Reflection</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The quiet moments before dawn are always the most grounding.</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Midnight Reflection')).toBeInTheDocument();
    expect(screen.getByText(/the quiet moments before dawn/i)).toBeInTheDocument();
  });
});

