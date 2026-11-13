import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Feed Query Filters & Pagination', () => {
  const buildFeedQuery = ({ emotion = 'All', search = '', page = 1, limit = 8 }) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (emotion && emotion !== 'All') {
      params.append('emotion', emotion);
    }
    if (search && search.trim()) {
      params.append('q', search.trim());
    }
    return params.toString();
  };

  it('builds default query string correctly', () => {
    const qs = buildFeedQuery({});
    assert.equal(qs, 'page=1&limit=8');
  });

  it('includes emotion filter when not "All"', () => {
    const qs = buildFeedQuery({ emotion: 'Hopeful', page: 2 });
    assert.equal(qs, 'page=2&limit=8&emotion=Hopeful');
  });

  it('includes search query when provided', () => {
    const qs = buildFeedQuery({ search: 'midnight calmness' });
    assert.equal(qs, 'page=1&limit=8&q=midnight+calmness');
  });

  it('calculates total pagination pages accurately', () => {
    const calculateTotalPages = (total, limit) => Math.ceil(total / limit) || 1;
    assert.equal(calculateTotalPages(0, 8), 1);
    assert.equal(calculateTotalPages(8, 8), 1);
    assert.equal(calculateTotalPages(9, 8), 2);
    assert.equal(calculateTotalPages(25, 8), 4);
  });
});

