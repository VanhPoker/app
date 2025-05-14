import React from 'react';
import { render, screen } from '@testing-library/react';

import AlphabetTracerReactComponent from './App';

test('renders learn react link', () => {
  render(<AlphabetTracerReactComponent />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
