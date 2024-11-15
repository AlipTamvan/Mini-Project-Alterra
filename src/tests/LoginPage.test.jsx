import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPageTemplate from "../components/templates/LoginTemplate";
import useUserStore from "../stores/userStore";
import { userApi } from "../services/userService";
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

describe("LoginPageTemplate", () => {
  test("renders header, form, and footer", () => {
    render(
      <MemoryRouter>
        <LoginPageTemplate />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign in to EcoQuiz/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  test("displays error message on login failure", async () => {
    // Mocking userApi.loginUser to throw an error
    const mockLoginUser = vi.fn().mockRejectedValue(new Error("Login failed"));
    vi.spyOn(userApi, "loginUser").mockImplementation(mockLoginUser); // Menggunakan spyOn untuk mock

    render(
      <MemoryRouter>
        <LoginPageTemplate />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByTestId("login-button")); // Menggunakan getByTestId

    // Gunakan matcher yang lebih fleksibel
    const errorMessage = await screen.findByText((content, element) => {
      return content.includes("Login failed")
    });
    expect(errorMessage).toBeInTheDocument();
  });

  test("renders login button when not authenticated", () => {
    render(
      <MemoryRouter>
        <LoginPageTemplate />
      </MemoryRouter>
    );

    const loginButton = screen.getByTestId("login-button"); // Menggunakan getByTestId
    expect(loginButton).toBeInTheDocument(); // Memastikan tombol ada
  });

  test("renders Google login button", () => {
    render(
      <MemoryRouter>
        <LoginPageTemplate />
      </MemoryRouter>
    );

    const googleLoginButton = screen.getByRole("button", {
      name: /Sign in with Google/i,
    });
    expect(googleLoginButton).toBeInTheDocument();
  });

  test("renders reset password link", () => {
    render(
      <MemoryRouter>
        <LoginPageTemplate />
      </MemoryRouter>
    );

    const resetPasswordLink = screen.getByRole("link", {
      name: /Forgot Password?/i,
    });
    expect(resetPasswordLink).toBeInTheDocument();
  });
});