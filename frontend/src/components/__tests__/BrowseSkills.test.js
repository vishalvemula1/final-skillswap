/**
 * Comprehensive tests for BrowseSkills component
 * Tests browsing, filtering, authorization, and request sending
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrowseSkills from '../BrowseSkills';
import { AuthProvider } from '../../context/AuthContext';

// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

const mockCategories = [
  { id: 1, name: 'Programming', description: 'Coding skills' },
  { id: 2, name: 'Languages', description: 'Language skills' }
];

const mockSkills = [
  {
    id: 1,
    name: 'Python',
    category: 'Programming',
    description: 'Python programming',
    teachers: [
      {
        id: 2,
        username: 'teacher1',
        location: 'NYC',
        experience_level: 'Advanced',
        avg_rating: 4.5
      },
      {
        id: 3,
        username: 'teacher2',
        location: 'LA',
        experience_level: 'Intermediate',
        avg_rating: 4.0
      }
    ]
  },
  {
    id: 2,
    name: 'JavaScript',
    category: 'Programming',
    description: 'JS programming',
    teachers: []
  }
];

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    user: mockUser,
    loading: false
  })
}));

const renderBrowseSkills = () => {
  return render(<BrowseSkills />);
};

describe('BrowseSkills Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // Rendering Tests

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderBrowseSkills();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders skills list after loading', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText('Python')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  test('renders empty state when no skills', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText(/no skills found/i)).toBeInTheDocument();
    });
  });

  test('renders filter inputs', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search skills/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/filter by location/i)).toBeInTheDocument();
    });
  });

  // Data Loading Tests

  test('loads categories on mount', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/categories/'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  test('loads skills on mount', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/skills/browse/'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  // Filter Tests

  test('search filter updates URL', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search skills/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search skills/i);
    fireEvent.change(searchInput, { target: { value: 'Python' } });

    // Debounced, so wait
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Python'),
        expect.any(Object)
      );
    }, { timeout: 500 });
  });

  test('location filter updates URL', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/filter by location/i)).toBeInTheDocument();
    });

    const locationInput = screen.getByPlaceholderText(/filter by location/i);
    fireEvent.change(locationInput, { target: { value: 'NYC' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('location=NYC'),
        expect.any(Object)
      );
    }, { timeout: 500 });
  });

  test('category filter updates URL', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('category_id=1'),
        expect.any(Object)
      );
    }, { timeout: 500 });
  });

  test('debounces search input', async () => {
    fetch
      .mockResolvedValue({
        ok: true,
        json: async () => ({ skills: [], categories: [] })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search skills/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search skills/i);

    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'P' } });
    fireEvent.change(searchInput, { target: { value: 'Py' } });
    fireEvent.change(searchInput, { target: { value: 'Pyt' } });
    fireEvent.change(searchInput, { target: { value: 'Pyth' } });

    // Should only trigger once after debounce period
    await waitFor(() => {
      const searchCalls = fetch.mock.calls.filter(call =>
        call[0].includes('search=Pyth')
      );
      expect(searchCalls.length).toBe(1);
    }, { timeout: 500 });
  });

  // Teacher Display Tests

  test('displays teacher information', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText('teacher1')).toBeInTheDocument();
      expect(screen.getByText('teacher2')).toBeInTheDocument();
      expect(screen.getByText(/NYC/)).toBeInTheDocument();
      expect(screen.getByText(/LA/)).toBeInTheDocument();
    });
  });

  test('displays teacher count', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText(/Teachers Available \(2\)/i)).toBeInTheDocument();
    });
  });

  test('shows message when no teachers available', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText(/no teachers available/i)).toBeInTheDocument();
    });
  });

  // Request Sending Tests

  test('opens modal when clicking request button', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      });

    renderBrowseSkills();

    await waitFor(() => {
      const requestButtons = screen.getAllByText(/request/i);
      expect(requestButtons.length).toBeGreaterThan(0);
    });

    const requestButtons = screen.getAllByRole('button', { name: /request/i });
    fireEvent.click(requestButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/send skill exchange request/i)).toBeInTheDocument();
    });
  });

  test('modal shows correct teacher info', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      });

    renderBrowseSkills();

    await waitFor(() => {
      const requestButtons = screen.getAllByRole('button', { name: /request/i });
      fireEvent.click(requestButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/To:.*teacher1/i)).toBeInTheDocument();
      expect(screen.getByText(/Skill:.*Python/i)).toBeInTheDocument();
    });
  });

  test('successfully sends request', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Request sent' })
      });

    renderBrowseSkills();

    await waitFor(() => {
      const requestButtons = screen.getAllByRole('button', { name: /request/i });
      fireEvent.click(requestButtons[0]);
    });

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /send request/i });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/requests/send/'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  test('does not show request button for own profile', async () => {
    const skillsWithSelf = [{
      ...mockSkills[0],
      teachers: [
        { id: 1, username: 'testuser' } // Current user
      ]
    }];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: skillsWithSelf })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Should not have request button for own profile
    const requestButtons = screen.queryAllByRole('button', { name: /request/i });
    expect(requestButtons.length).toBe(0);
  });

  // Error Handling Tests

  test('handles network error when loading skills', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    renderBrowseSkills();

    await waitFor(() => {
      // Should show empty state or error message
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  test('handles error when sending request', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: mockSkills })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Request already sent' })
      });

    window.alert = jest.fn(); // Mock alert

    renderBrowseSkills();

    await waitFor(() => {
      const requestButtons = screen.getAllByRole('button', { name: /request/i });
      fireEvent.click(requestButtons[0]);
    });

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /send request/i });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('already sent'));
    });
  });

  // Edge Case Tests

  test('handles skills with no description', async () => {
    const skillsWithoutDesc = [{
      ...mockSkills[0],
      description: ''
    }];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: skillsWithoutDesc })
      });

    renderBrowseSkills();

    await waitFor(() => {
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });

  test('handles XSS in skill name', async () => {
    const xssSkill = [{
      ...mockSkills[0],
      name: '<script>alert("xss")</script>'
    }];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: xssSkill })
      });

    renderBrowseSkills();

    await waitFor(() => {
      // Should display as text, not execute
      const skillElements = screen.getAllByText(/script/i);
      expect(skillElements.length).toBeGreaterThan(0);
    });
  });
});
