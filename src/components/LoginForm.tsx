import React, { useState } from "react";
import "./LoginForm.css";
import { login } from "../shared/api/auth";
import { LoginResponse } from "../shared/types/user";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email обязателен для заполнения";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Введите корректный email адрес";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен для заполнения";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response.error) {
        let errorMessage = "Произошла ошибка при входе в систему";

        switch (response.status) {
          case 400:
            errorMessage = "Неверный формат данных запроса";
            setErrors({
              general: errorMessage,
            });
            break;
          case 401:
            errorMessage = "Неверный email или пароль";
            setErrors({
              general: errorMessage,
            });
            break;
          case 403:
            errorMessage = "Email не подтвержден. Проверьте почту для подтверждения.";
            setErrors({
              general: errorMessage,
            });
            break;
          case 500:
            errorMessage = "Ошибка сервера. Попробуйте позже.";
            setErrors({
              general: errorMessage,
            });
            break;
          default:
            setErrors({
              general: errorMessage,
            });
        }
        return;
      }

      if (response.data) {
        // Успешный вход
        const loginData: LoginResponse = response.data;

        // Сохраняем токен в localStorage
        localStorage.setItem("access_token", loginData.access_token);
        localStorage.setItem("user", JSON.stringify(loginData.user));

        alert(
          `Добро пожаловать в систему мониторинга, ${loginData.user.first_name}!`
        );

        // Очищаем форму
        setFormData({ email: "", password: "" });
      }
    } catch (error) {
      setErrors({
        general:
          "Не удалось подключиться к серверу. Проверьте подключение к интернету.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Panel - Hero Section */}
        <div 
          className="auth-hero"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/hero-image.jpg)`
          }}
        >
          <div className="hero-content">
            <h2 className="hero-title">
              Welcome to
              <br />
              <span className="hero-title-accent">Qamqor Vision</span>
            </h2>
            <p className="hero-subtitle">Your Eyes on Safety.</p>
            <p className="hero-description">
              Мы превращаем видеонаблюдение<br />
              в интеллектуального помощника, который понимает,<br />
              где и когда может возникнуть опасность.
            </p>
          </div>
          <div className="hero-decor hero-decor-1"></div>
          <div className="hero-decor hero-decor-2"></div>
        </div>

        {/* Right Panel - Sign In Form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <h1 className="form-title">Вход</h1>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email адрес
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`form-input ${errors.email ? "form-input-error" : ""}`}
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Пароль
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введите ваш пароль"
                    className={`form-input ${errors.password ? "form-input-error" : ""}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {errors.general && (
                <div className="error-message error-general">{errors.general}</div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                <span className="button-content">
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Отправка...
                    </>
                  ) : (
                    <>
                      Войти
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="button-arrow"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <div className="form-footer">
                <a href="#" className="forgot-password-link">
                  Забыли пароль?
                </a>
              </div>
            </form>

            <div className="signup-link">
              Нет аккаунта?{' '}
              <a href="#" className="signup-link-text">
                Зарегистрироваться
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
