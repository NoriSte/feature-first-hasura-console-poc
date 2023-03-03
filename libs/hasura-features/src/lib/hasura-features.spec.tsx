import { render } from '@testing-library/react';

import HasuraFeatures from './hasura-features';

describe('HasuraFeatures', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<HasuraFeatures />);
    expect(baseElement).toBeTruthy();
  });
});
