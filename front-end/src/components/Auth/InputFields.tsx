import type { UseFormRegister, Path, FieldValues, FieldErrors } from "react-hook-form";

interface InputFieldProps<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export default function InputField <T extends FieldValues> ({
  id, label, type="text", placeholder, register, errors,
}: InputFieldProps<T>)  {
  const errorMessage = errors[id]?.message as string | undefined;

  return(
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className={`w-full bg-background px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200
          ${errors[id]
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
          }
        `}
      />
      {errorMessage && (
        <p className="mt-1 text-xs text-red-500 italic">
          {errorMessage}
        </p>
      )}
    </div>
  )
}