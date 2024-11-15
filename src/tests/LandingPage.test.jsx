// LandingPageTemplate.test.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPageTemplate from "../components/templates/LandingPageTemplate";
import useUserStore from "../stores/userStore";
import { vi } from "vitest";
import "@testing-library/jest-dom";

beforeEach(() => {
  // Set isAuthenticated ke false sebagai default
  useUserStore.setState({ isAuthenticated: false });
});

// Bersihkan mocks setelah setiap tes
afterEach(() => {
  vi.clearAllMocks();
});

describe("LandingPageTemplate", () => {
  test("renders welcome message", () => {
    // Mocking the Zustand store
    const mockStore = {
      isAuthenticated: false,
      setIsAuthenticated: vi.fn(),
      setUser: vi.fn(),
      logout: vi.fn(),
    };

    vi.spyOn(useUserStore, "getState").mockReturnValue(mockStore);

    render(
      <MemoryRouter>
        <LandingPageTemplate />
      </MemoryRouter>
    );

    const welcomeMessage = screen.getByText(/Welcome to EcoQuiz World!/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  test("renders login button when not authenticated", () => {
    useUserStore.setState({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <LandingPageTemplate />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("link", { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("renders create quiz button when authenticated", () => {
    useUserStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <LandingPageTemplate />
      </MemoryRouter>
    );

    const createQuizButton = screen.getByText(/Create a Quiz/i);
    expect(createQuizButton).toBeInTheDocument();
  });

  test("renders environmental topics section", () => {
    render(
      <MemoryRouter>
        <LandingPageTemplate />
      </MemoryRouter>
    );

    const topicsHeading = screen.getByText(/Environmental Topics/i);
    expect(topicsHeading).toBeInTheDocument();
  });

  test("renders environmental facts section", () => {
    render(
      <MemoryRouter>
        <LandingPageTemplate />
      </MemoryRouter>
    );

    const factsHeading = screen.getByText(/Environmental Facts/i);
    expect(factsHeading).toBeInTheDocument();
  });
});
