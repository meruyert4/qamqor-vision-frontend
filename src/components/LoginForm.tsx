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
    <div className="login-container">
      <div className="security-background">
        <div className="security-icon">🔒</div>
        <div className="security-icon">👁️</div>
        <div className="security-icon">🚸</div>
        <div className="pulse-ring"></div>
      </div>

      <div className="login-form-wrapper">
        <div className="brand-header">
          <div className="logo">
            <span className="logo-icon">👶</span>
            <span className="logo-pulse"></span>
          </div>
          <h1 className="system-name">Qamqor Vision</h1>
          <p className="system-description">
            Система видеомониторинга для выявления возможных чрезвычайных ситуаций 
          </p>
        </div>

        <h2 className="login-title">Вход в систему</h2>
        
        <form onSubmit={handleSubmit} className="login-form" noValidate>
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
              className={`form-input ${errors.email ? "form-input-error" : ""}`}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "form-input-error" : ""}`}
              disabled={isSubmitting}
            />
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
                "Войти"
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;