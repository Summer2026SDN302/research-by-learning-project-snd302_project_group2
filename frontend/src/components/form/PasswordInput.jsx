import { useState } from "react";

const defaultInputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 pr-11 text-body-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

const PasswordInput = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helper,
  placeholder = "••••••••",
  autoComplete = "current-password",
  disabled = false,
  inputClassName = defaultInputClass,
  labelClassName = "mb-1 block font-label-md text-label-md text-on-surface-variant",
  wrapperClassName = "",
  leftIcon = null,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className={labelClassName} htmlFor={id || name}>
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={id || name}
          name={name}
          className={`${inputClassName} ${leftIcon ? "pl-11" : ""} ${
            error ? "border-error" : "border-outline-variant"
          }`}
          type={isVisible ? "text" : "password"}
          value={value}
          lang="en"
          spellCheck={false}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={placeholder}
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-outline hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
          onClick={() => setIsVisible((prev) => !prev)}
          disabled={disabled}
          aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isVisible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-body-sm text-error">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-body-sm text-on-surface-variant/70">{helper}</p>
      ) : null}
    </div>
  );
};

export default PasswordInput;
